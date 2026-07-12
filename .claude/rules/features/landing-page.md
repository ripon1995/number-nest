# Landing page

A public, unauthenticated page for visitors to browse upcoming [[notice]]s and look up a
[[course]]'s weekly routine (schedule) — no login required, and nothing on it is editable.
This is the only public-facing surface in the system; every other feature stays gated behind
`get_current_teacher` as before (see [[teacher]]).

## Routing

`/` is now the public landing page (`LandingPage`, not wrapped in `ProtectedRoute`), rendered
without the `NavMenu` sidebar — same conditional-rendering technique `AppNav` already uses to
hide `NavMenu` for a logged-out visitor. `DashboardPage` moves from `/` to a new protected
route, `/dashboard`; `NavMenu`'s "Dashboard" link and the post-login redirect (`LoginPage`)
both point at `/dashboard` instead of `/`. A logged-in teacher who navigates to `/` still sees
the public landing page (no auto-redirect to `/dashboard`) — the landing page and the
authenticated app are independent surfaces, not mutually exclusive. `NavMenu` also gains a
"Landing page" link (`HomeIcon`, first item, pointing at `/`) so a logged-in teacher can get
back to it without leaving the URL bar — clicking it exits the sidebar/protected-route shell
just like any other navigation to `/`.

## Backend

`app/public/` — read-only, **no** `get_current_teacher` dependency anywhere in this module
(the one deliberate exception to every other router requiring it). Rather than duplicating
query logic, its `PublicService` wraps `CourseRepository` and `NoticeRepository` directly
(the same repositories [[course]]'s `CourseService` and [[notice]]'s `NoticeService` use) —
router stays thin per [Backend architecture](../../CLAUDE.md#backend-architecture), no new
models/schemas of its own, reusing `CourseRead`/`NoticeRead`.

- `GET /public/courses` — every course (`CourseRead`, unfiltered), used to populate the
  "Watch your routine" course `<select>` and to resolve a notice's `course_id` to a course
  name client-side (same lookup-map pattern every other feature already uses — `NoticeRead`
  only carries `course_id`, not a nested course object).
- `GET /public/notices` — **upcoming notices only** (`event_datetime >= now`, ascending —
  soonest first), via a new `NoticeRepository.list_upcoming(now)` method. This is a public
  page, not an archive, so past events are filtered out server-side rather than client-side.

## Frontend

`LandingPage` (`frontend/src/pages/LandingPage.tsx` + `frontend/src/pages/landing/`) is backed
by a `publicStore` (`fetchPublicCourses`/`fetchPublicNotices`), fetched unauthenticated (no
bearer header — `src/api/client.ts`'s auth-header attachment is conditional on a stored
session, so these calls simply go out without one). The page has two sections:

- **Notices** — a single horizontally-scrolling row of cards (`NoticeCard`, `.notice-grid` is
  `display: flex; overflow-x: auto`, not a wrapping grid — deliberately never breaks into
  multiple lines), one per upcoming notice: `event_name`, `event_place`, `event_datetime`
  (formatted), and the course name resolved via the fetched `/public/courses` list. No
  click-through, no detail page — cards are display-only.
- **Routine** — a section heading ("Routine") sits before the container, same as "Notices"
  sits before its card row; the container itself holds a centered, wide course `<select>`
  labelled "Select your course" (populated from `/public/courses`). Picking a course renders
  a `RoutineTable` below it — a real HTML `<table>`, one row per entry in that course's
  `course_days` (sorted into canonical Mon→Sun order, since the array's stored order isn't
  guaranteed — reuse the `CourseDay` enum's declaration order), columns Day | Time, `class_time`
  formatted and repeated per row (one time for the whole course, not per-day — see [[course]]).
  The course's `note` — not `course_motto`, which doesn't appear here — renders **below** the
  table, styled bold and red, as a standout callout rather than routine detail. Nothing here is
  a form — this whole section is read-only, same as the notice cards.

## Rules

- Nothing under `/public/*` requires auth, and nothing on `LandingPage` is a create/edit/delete
  form — nothing there mutates state. Nothing here has a detail page — this is the one part of
  the app deliberately shallower than the list-table + detail-page pattern used elsewhere.
- `/public/*` reuses the same `CourseRead`/`NoticeRead` response schemas the authenticated
  `/courses`/`/notices` routes return — no visitor-specific trimming of fields. Nothing on
  `Course`/`Notice` is sensitive, so this is a deliberate simplification, not an oversight.
- If a visitor picks a course with zero `course_days` this can't happen — `course_days` has a
  `min_length=1` validator (see [[course]]) — so `RoutineTable` can assume at least one row.