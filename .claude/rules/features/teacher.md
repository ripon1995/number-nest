# Teacher (Admin)

The teacher's account is the system's sole **admin**. Since role-based access landed (see
[[role-based-access]]), the underlying account model is a generic `User` (`app/users/`, was
`app/teacher/`) carrying a `role` — `admin` or `student` — rather than a teacher-only account.
This file covers the admin side of that (the original single-teacher rules, updated); see
[[role-based-access]] for the full student side and the mechanics of the role split.

## Rules

- Single admin only — not multi-tenant, no admin-course/teacher-course assignment relation.
  There is exactly one admin account (the original teacher account, backfilled to `role=admin`
  by the migration that introduced `role`) and no way to create a second one from the client —
  `POST /auth/register` (the public, unauthenticated endpoint) always creates a `role=student`
  account and never accepts a `role` field. A second admin can only be created via the
  admin-gated `POST /auth/register-admin` API endpoint, which is deliberately never called from
  the frontend (no button, no form) — see [[role-based-access]].
- The admin is the actor with full create/update/delete rights across the entire system — they
  add/manage [[students]] and [[course]] records, and everything else. Every mutating route in
  every feature module is gated behind a `require_admin` dependency (`app/core/dependencies.py`)
  layered on top of the same authentication every logged-in account gets.
- Students *can* now log in — self-registration is open and unlimited (`POST /auth/register`,
  route `/register`) — but a student account is read-only everywhere: every `GET` route across
  the app stays reachable, but every mutating route (create/update/delete, plus the inline
  fee-paid/discontinue toggles on [[enrollment]]) returns a 403 (`PermissionDeniedException`,
  message "Permission denied", shown via the same `ErrorDialog` every other error uses — no
  dedicated dialog component was needed). Students see the exact same data an admin sees, not a
  scoped-to-self view. See [[role-based-access]] for the full writeup.
- No many-to-many admin-course relation — a course simply belongs to the one admin/system, same
  as before.
- Auth is a short-lived JWT access token plus an opaque, DB-backed refresh token (`RefreshToken`
  model, only the SHA-256 hash is stored). `/auth/refresh` rotates the refresh token on every use
  (old one revoked, new one issued); `/auth/logout` revokes it. `get_current_user`
  (`app/core/dependencies.py`, was `get_current_teacher`) only ever validates the access token
  and returns whichever role the account has — it has no knowledge of refresh tokens.
  `require_admin` builds on top of it, checking `role == admin`.