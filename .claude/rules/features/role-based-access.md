# Role-based access (Admin / Student)

**Status: Implemented**, both backend and frontend, per this plan. [[teacher]] and
`CLAUDE.md`'s Status narrative have been updated to reflect the shipped behavior. This document
is kept as the implementation record/rationale rather than retired — [[teacher]] carries the
current living rules, this file explains the decisions and sequencing behind them.

## Summary

Today [[teacher]] is the sole account type and the sole login: single row, no `role` concept,
every route requires `get_current_teacher`. This plan adds a second account type, **Student**,
that can log in and view every page, but is blocked from every create/update/delete action —
which surfaces to them as a "Permission denied" dialog, reusing the existing `ErrorDialog`
component rather than a new one.

Key decisions this plan is built on (already agreed):

1. **Account model** — `Teacher` is renamed to a generic `User` (table `users`), gaining a
   `role` column (`admin` / `student`). A student's *login account* is a bare
   `email`/`password`/`role` row in this table, with **no relation** to the existing `Student`
   domain model (name/contact/college/enrollments used for the school-management side of the
   app). They are unrelated concepts that happen to share the word "student."
2. **Account creation** — Self-registration stays open in the client, but `POST /auth/register`
   only ever creates `role=student` accounts — it never accepts a `role` field from the caller,
   so it can't be used to create an admin, by a student-facing client or anyone else. Admin
   accounts are created through a **separate, dedicated API endpoint** that requires the caller
   to already be authenticated as an admin (`Depends(require_admin)`) — real API, no script, no
   frontend UI anywhere calls it. See "Admin account creation" under Backend changes below. The
   already-migrated single existing teacher row (backfilled to `role=admin`) is what lets this
   bootstrap cleanly — there's no chicken-and-egg problem since an admin already exists the
   moment this ships, and only that admin (or one it creates) can ever create another.
3. **Enforcement layer** — Real backend enforcement (HTTP 403), not a frontend-only gate. The
   frontend additionally reads `role` to shape the UI, but the API is the actual boundary.
4. **Where student data-visibility stops** — per the request, students see **everything** an
   admin sees (every student's contact info, every payment, every expense, etc.) — this is a
   read-only mirror of the admin's view, not a scoped-to-self view. Flagged again under Open
   questions below since it's a real data-exposure choice worth double-checking before shipping.

## Data model changes

- Rename module `app/teacher/` → `app/users/` (matches the rest of the codebase's
  resource-named-module convention — `app/students/`, `app/courses/`, etc.). Rename `Teacher`
  → `User` throughout (model, schemas, service, repository, router, and every import site).
- `User` model (`app/users/models.py`, was `Teacher`):
  - All existing fields (`id`, `email`, `name`, `hashed_password`, `created_at`) unchanged.
  - New `role: Mapped[str]` column, backed by a Pydantic enum (`UserRole`: `admin`, `student`)
    validated at the schema layer — same "plain string column, not a native Postgres enum"
    convention [[course]]'s `subject`/`class_level`/[[expense-tracking]]'s `category` already
    use, for the same reason (adding a role later is an app-layer change, not `ALTER TYPE`).
  - Not nullable, no default at the Python/Pydantic layer (every new row must declare a role
    explicitly) — see the migration below for backfilling the one existing row.
- `RefreshToken` model: rename `teacher_id` → `user_id` (FK target becomes `users.id`).
- Table rename: `teachers` → `users`. Since this table has exactly one row today, this is a
  single straightforward Alembic migration (hand-written `upgrade`/`downgrade`, per this
  project's convention — see `CLAUDE.md`'s Backend commands):
  1. `ALTER TABLE teachers RENAME TO users`
  2. `ALTER TABLE refresh_tokens RENAME COLUMN teacher_id TO user_id`
  3. Add `role VARCHAR NOT NULL DEFAULT 'admin'` to `users` (the default backfills the one
     existing row to `admin`; drop the server default afterward, same "backfill then tighten"
     pattern this project already uses elsewhere — e.g. `expenses`' `paid_to`/`paid_by` stayed
     nullable at the DB, enforced by Pydantic instead, since there was no clean backfill value;
     here there *is* one, so tightening to `NOT NULL` with no default is possible and preferred)
  4. Rename the FK constraint/index names touching `teacher_id` if Alembic's naming convention
     requires it (check the existing migration for `refresh_tokens`' FK name).

## Backend changes

- `app/core/exceptions.py` already has `AuthorizationException` (403, message "You are not
  authorized to perform this action") — reuse its shape but add a dedicated subclass so the
  dialog's headline is literally the requested copy:
  ```python
  class PermissionDeniedException(AuthorizationException):
      message = "Permission denied"
  ```
  (`ErrorDialog` renders `error.message` as the `<h2>` title and `error.detail` as the subtext
  — raising `PermissionDeniedException("Only an admin can do this.")` gives a title of
  "Permission denied" with a more specific detail line underneath, matching the project's
  existing message/detail split.)
- `app/core/dependencies.py`:
  - Rename `get_current_teacher` → `get_current_user` (returns `User`, either role) — this
    keeps its current job of "is there a valid access token," used at router level so **every**
    feature router still requires login, just no longer implies admin.
  - Add a new dependency:
    ```python
    async def require_admin(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role != UserRole.admin:
            raise PermissionDeniedException()
        return current_user
    ```
- `app/users/service.py` (was `TeacherService`):
  - `register` drops the `exists_any()` admin-gate entirely and always creates
    `role=UserRole.student` — `UserRegister` (was `TeacherRegister`) no longer accepts a
    `role` field from the client at all, so there is no code path an attacker could use to
    request `role=admin`. Uniqueness is still just the existing `email` unique constraint —
    any number of student accounts can be created.
  - New method `register_admin(payload: UserRegister) -> User` — identical body to `register`
    except it hardcodes `role=UserRole.admin` instead of `student`. Kept as a distinct method
    (not a `role` parameter on `register`) so the public self-registration path has no branch
    that could ever be pointed at admin creation, even by a future refactor.
  - `login`/`refresh`/`logout`/`get_by_id` are otherwise unchanged (role isn't consulted here —
    it's checked per-route via `require_admin`, not baked into the token).
  - `UserRead` (was `TeacherRead`) gains `role` so the frontend can read it off `/auth/me`.
- Per-feature routers — this is the bulk of the backend work. Every router below currently
  gates its **entire** route set with one router-level
  `dependencies=[Depends(get_current_teacher)]`. That becomes `Depends(get_current_user)`
  (any logged-in user may still hit every `GET`), and each mutating route additionally gets
  `Depends(require_admin)`. Exact routes to add it to, per module:
  - `app/courses/router.py` — `POST /courses`, `PUT /courses/{id}`, `DELETE /courses/{id}`
  - `app/students/router.py` — `POST /students`, `PUT /students/{id}`, `DELETE /students/{id}`
  - `app/enrollments/router.py` — `POST /enrollments`, `PATCH /enrollments/{id}/fee-paid`,
    `PATCH /enrollments/{id}/discontinue`, `DELETE /enrollments/{id}`
  - `app/payments/router.py` — `POST /payments`, `DELETE /payments/{id}`
  - `app/attendance/router.py` — `POST /attendance/bulk`, `DELETE /attendance/{id}`
  - `app/exams/router.py` — `POST /exams`, `PUT /exams/{id}`, `DELETE /exams/{id}`
  - `app/notices/router.py` — `POST /notices`, `DELETE /notices/{id}`
  - `app/marks/router.py` — `POST /marks/bulk`, `DELETE /marks/{id}`
  - `app/expenses/router.py` — `POST /expenses`, `PUT /expenses/{id}`, `DELETE /expenses/{id}`
  - `app/public/router.py` — **untouched**. It has no auth dependency at all today and stays
    that way; role-gating is irrelevant to an already-unauthenticated route.
  - Every `GET` route in every module above stays reachable by both roles — this is what
    delivers "student can view all."
- `app/main.py` — only the import line for the renamed router module changes
  (`app.teacher.router` → `app.users.router`); no route/prefix changes (`/auth/...` stays put).

## Admin account creation

Part of this plan's initial implementation (not deferred) — a real, authenticated API endpoint,
never a script and never wired into the frontend:

- `app/users/router.py` (was `app/teacher/router.py`): a new route,
  `POST /auth/register-admin`, `response_model=UserRead`, gated by
  `Depends(require_admin)` — only a caller already holding a valid admin's access token can hit
  it. Body is the same `UserRegister` shape (`email`/`name`/`password`) as the public endpoint;
  the route calls `UserService.register_admin` instead of `register`.
- This is deliberately **not** exposed anywhere in the frontend — no button, no form, no route
  in `App.tsx`. It's meant to be called directly (curl/Postman/HTTPie) by whoever already holds
  admin credentials, the same operational trust level as hitting any other authenticated
  mutating endpoint directly. `frontend/src/api/` gets no corresponding helper.
- Bootstrapping isn't a problem: the migration backfills the existing teacher row to
  `role=admin` *before* this endpoint ships, so there's always at least one admin able to call
  it from day one. If that admin is ever lost, recovery is a direct DB fix (or a manual
  `UPDATE users SET role='admin' ...`), same as today's implicit assumption that the one teacher
  account is never fully lost — not something this plan changes.
- Add to the Testing checklist: an admin's token can call `POST /auth/register-admin` and the
  new account can subsequently log in as `role=admin`; a student's token gets the standard 403
  `PermissionDeniedException` from `require_admin` when attempting the same call.

## Admin password reset

Added after the initial role-based-access rollout, once it became clear an admin needed a way
to help a student (or another admin) who forgot their password — this is **not** the
self-service "forgot password" flow flagged as out-of-scope below; it's an admin manually
setting a new password for an account they already know the email of. Same admin-gated shape as
account creation above, but — unlike `register-admin` — this one *is* wired into the frontend,
since resetting a locked-out user's password is an ordinary admin task, not a rare
bootstrap-only operation:

- `app/users/router.py`: `PATCH /auth/reset-password`, `response_model=UserRead`, gated by
  `Depends(require_admin)`. Body is `PasswordResetRequest` (`email` + `new_password`) —
  deliberately not `UserRegister`, since no `name` is needed and creating a new account isn't
  the point. `UserService.reset_password` looks the account up by email (`NotFoundException`,
  404, if none exists — there's no ambiguity about "which account" the way there could be with
  an id, since `email` is unique), hashes and sets `new_password` via a new
  `UserRepository.update_password`, then calls a new `RefreshTokenRepository.revoke_all_for_user`
  to revoke every refresh token already issued to that account. That revocation matters: without
  it, a session started under the old password would keep working via `/auth/refresh` until its
  refresh token naturally expired, which would defeat the point of a reset (e.g. if the account
  was compromised, not just forgotten).
- No restriction on the target account's role — the same endpoint resets a student's password or
  another admin's, since both are just rows in `users` looked up by email. The restriction is
  entirely on the caller (`require_admin`), not the target.
- Unlike `register-admin`, this **is** exposed in the frontend: `frontend/src/api/auth.ts` gets a
  `resetPassword` helper, and `ProfilePage` renders an admin-only section (`useIsAdmin()`-gated,
  below a divider separating it from the account-details card) containing a
  `.profile-admin-actions-buttons` row — intentionally a generic container, not a single
  bespoke button wrapper, so future admin-only actions have a place to go — currently holding one
  button, "Reset a user's password", that opens `ResetPasswordDialog`
  (`frontend/src/pages/profile/ResetPasswordDialog.tsx`, rendered in the shared `Modal`, same
  create-form shape as every other feature's form dialog: email + new-password inputs,
  Cancel/submit buttons). On success the dialog closes and `ProfilePage` shows an inline
  "Password reset for {email}." confirmation; on error the dialog stays open and the error
  surfaces through the same page-level `ErrorDialog` every other mutating page uses — no new
  error-handling pattern needed.

## Frontend changes

- `src/types/auth.ts`: rename `Teacher` → `User`, add `role: 'admin' | 'student'`.
- `authStore`: rename the `teacher` field → `user` (mechanical rename, touches `Header`,
  `ProtectedRoute`, `LoginPage`, `RegisterPage`, `ProfilePage`, `App.tsx`'s `AppNav`) and add a
  derived `isAdmin` boolean (`role === 'admin'`) for convenient use in components — but see the
  next bullet before reaching for it everywhere.
- **Do not hide or disable mutating buttons/inputs for students by default.** The request is
  specifically that a student *can click* Add/Edit/Delete and *gets told* "Permission denied"
  — not that the controls disappear. Recommended v1: change nothing about which buttons render;
  let the existing 403 flow (see next bullet) handle it. Hiding controls per-role is a
  reasonable later polish pass, not required for correctness, and would need to touch every one
  of the ~9 feature pages plus the two inline-editable `EnrollmentTable` controls
  (`enrollment_fee_paid` checkbox, `discontinued_at` date input) individually.
- **The "Permission denied" dialog needs no new component.** Every mutating page already
  follows the same pattern (confirmed in `CoursesPage.tsx` and present in 13 of 14 page files):
  a local `error: ApiError | null` state, a `catch (err) { setError(toApiError(err)) }` around
  each store action, and `<ErrorDialog error={error} onClose={...} />` rendered at the bottom.
  A 403 from `PermissionDeniedException` flows through `api/client.ts`'s existing
  `if (!response.ok) throw new ApiError(...)` path exactly like any other error today — it will
  render in the same `ErrorDialog`, with `error.message === 'Permission denied'` as the title,
  automatically, once the backend change above ships. **No frontend change is required for the
  dialog itself** — only verify each page's mutation handlers are actually wrapped in
  try/catch → `setError` (they already are in the pages inspected; spot-check the ones not
  listed above — `attendance/MonthlyAttendance.tsx`, `courses/CourseDetailPage.tsx`,
  `exams/ExamDetailPage.tsx`, `expenses/ExpenseDetailPage.tsx`, `students/StudentDetailPage.tsx`
  — before assuming coverage, since those weren't directly grepped for this plan).
- Re-enable student sign-up: `App.tsx` currently has `/register` commented out entirely (a
  leftover from the single-teacher-only era). Uncomment the route and repoint `RegisterPage` at
  it — since `/auth/register` now always creates a student account, no role picker is needed in
  the form; consider relabeling the page/copy from generic "Register" to "Student sign up" so
  it's clear this isn't how the admin account is created (the admin account already exists).
- `Header.tsx`: the unauthenticated state currently links to `/login` with the label "Teacher
  login" — reword to something role-neutral ("Log in") since students use the same login page
  and form (`LoginPage`/`api.login` need no changes — login doesn't care about role, only
  `/auth/me` afterward reveals it). Optionally add a "Sign up" link next to it pointing at the
  newly-restored `/register` for students.
- `NavMenu`/`App.tsx` routing: **no changes needed.** Every existing protected route already
  requires only "is someone logged in" (`ProtectedRoute` checks `user`, not role) — since
  students see every page too, the nav and route list stay exactly as-is.

## Migration / sequencing

1. Backend: write and run the `role` + table-rename Alembic migration (data-migrates the one
   existing row to `role='admin'`).
2. Backend: mechanical rename `app/teacher/` → `app/users/`, `Teacher` → `User` everywhere
   (imports, `Depends(get_current_teacher)` call sites, `app/main.py`'s router import).
3. Backend: add `PermissionDeniedException` and `require_admin`; update `UserService.register`
   to drop the admin gate and hardcode `role=student`; add `UserService.register_admin` and the
   `POST /auth/register-admin` route (`Depends(require_admin)`); update `UserRead`/`/auth/me` to
   expose `role`.
4. Backend: add `Depends(require_admin)` to each mutating route listed above, across all 9
   feature routers.
5. Frontend: rename `Teacher`→`User`/`teacher`→`user`, add `role` to the type and `isAdmin` to
   `authStore`.
6. Frontend: re-enable `/register`, adjust its copy, adjust `Header`'s login copy. No frontend
   work for admin creation — `register-admin` stays API-only, deliberately unwired from the UI.
7. Frontend: spot-check the five unverified pages listed above for try/catch → `ErrorDialog`
   coverage on every mutation path; add it where missing.
8. Update `CLAUDE.md`'s Status paragraph and [[teacher]] (the "single teacher... students have
   no login" lines) to reflect the shipped behavior; update or retire this file.

## Testing checklist

- Existing admin (migrated teacher row) can still do everything — full regression pass.
- A newly self-registered student can log in and view every list/detail page.
- A student clicking any Add/Edit/Delete/toggle control gets the "Permission denied"
  `ErrorDialog` (title exactly "Permission denied").
- A student hitting a mutating endpoint directly (curl/Postman, bypassing the UI) gets a real
  `403` — confirms this isn't just a frontend-level block.
- `POST /auth/register` cannot create a second `role=admin` account under any payload shape.
- Multiple students can self-register with no cap.
- The existing teacher's stored session (access/refresh tokens issued before the migration)
  keeps working after it — `get_current_user`'s token lookup is by `id`, unaffected by the
  table/column renames as long as the row's primary key is untouched.

## Open questions / follow-ups (not resolved by this plan)

- **Full data visibility for students is a deliberate but notable choice** — a logged-in
  student sees every other student's contact info, every payment record, every expense, etc.,
  not just their own. This plan implements exactly what was requested ("view all"), but it's
  worth a final confirmation before shipping, since it's a real access-control decision, not
  just a UI nicety.
- No admin-facing UI to list/manage/deactivate student accounts is planned here — out of scope
  unless requested separately.
- **Admin-driven password reset shipped** (see "Admin password reset" above), but a true
  **self-service "forgot password" flow is still out of scope** — a student who forgets their
  password still has to ask an admin, there's no unauthenticated `/auth/forgot-password` +
  emailed reset-token path. That would need email-sending infrastructure this project doesn't
  have yet, plus expiring/single-use reset tokens (unlike the admin flow, which needs neither
  since the admin is already authenticated and picks the new password directly).
- `ProfilePage` (routed today, not inspected for this plan) may need a look — confirm it
  doesn't assume `role === 'admin'` implicitly anywhere.
