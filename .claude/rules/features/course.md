# Course

Create and manage courses. Implemented as full CRUD in `app/courses/` (see
[Backend architecture](../../CLAUDE.md#backend-architecture)) — routes require
`get_current_teacher`. The frontend `CoursesPage` (`frontend/src/pages/CoursesPage.tsx`
+ `frontend/src/pages/courses/`) consumes this end-to-end: list/create/update/delete
go through a Zustand `courseStore`, and creating/editing a course happens in a `Modal`
dialog. Viewing a course is not a modal — clicking a row in `CourseTable` navigates to
`CourseDetailPage` at route `/courses/:id`, a full page showing a read-only course card
plus a table of the course's enrolled students (see [[enrollment]]). A course's `course_days`
+ `class_time` also drive the read-only routine table on the public [[landing-page]] — the one
place a course is surfaced outside teacher auth.

## Fields

- `course_name` — string, unique
- `course_fee` — decimal (`Numeric(10, 2)`), must be >= 0
- `enrollment_fee` — decimal (`Numeric(10, 2)`), must be >= 0 — the one-time fee charged when a
  student enrolls, distinct from `course_fee`'s recurring amount. Whether a given [[enrollment]]
  has actually paid it is tracked separately, on the `Enrollment` row (`enrollment_fee_paid`),
  not here — this field is just the course-level amount owed.
- `subject` — enum: `math`, `ict`. Validated by a Pydantic enum (`CourseSubject`
  in `app/courses/schemas.py`); stored as a plain string column, not a native
  Postgres enum type, to keep future value additions a simple app-layer change
  rather than a `ALTER TYPE` migration.
- `course_days` — list of weekdays (`mon`/`tue`/`wed`/`thu`/`fri`/`sat`/`sun`),
  at least one required. Validated by a Pydantic enum (`CourseDay`); stored as
  a Postgres `ARRAY(String)`, not an array of native enum, for the same reason
  as `subject`.
- `capacity` — positive integer
- `course_motto` — optional string
- `class_time` — time of day, required — the single time all of `course_days`' sessions run at
  (e.g. a course meeting Mon/Wed/Fri all meets at the same `class_time`; there's no
  per-day time). Stored as a plain `Time` column (no timezone, no seconds precision expected —
  fed from an HTML `<input type="time">`), same deliberate no-timezone treatment as
  [[exam]]'s `exam_datetime`/[[notice]]'s `event_datetime`.
- `note` — optional string, freeform instructions/context shown alongside the routine (e.g.
  room number, materials to bring) — distinct from `course_motto` (a short tagline shown on
  the course card/detail page); `note` is specifically what renders on the public
  [[landing-page]]'s routine table.
- (add fields as schema solidifies — keep this list in sync)

## Rules

- `id` is a UUID primary key, like every other table in this project.
- A course can have multiple students enrolled (many-to-many via enrollment, see [[enrollment]]).
- A course can have multiple teachers assigned (see [[teacher]]).
- No payment gateway logic lives here — fee is just the amount used by [[payment-tracking]] when recording manual payments.
- `course_name` is unique — creating or renaming to a name already in use raises a `ConflictException` (409).
- Unlike [[enrollment]], courses support edit-in-place (`PUT /courses/{id}`), not just add/delete.
- In the frontend list table, `course_fee` and `enrollment_fee` are rounded for display
  (`formatFee` in `src/pages/courses/courseDisplay.ts`, reused for both); the raw decimal
  string from the API is still sent unchanged on create/update. `course_motto` is
  intentionally omitted from the list table — it only appears in the create/edit form and
  the read-only detail page.
- `GET /courses/{id}` returns `CourseDetailRead` (`app/courses/schemas.py`) — the course
  fields plus `students: StudentRead[]`, the list of currently *actively* enrolled [[students]]
  (`list_students_for_course` filters out any [[enrollment]] with `discontinued_at` set — a
  discontinued student drops off the roster, though their `Enrollment` row and history remain).
  `CourseService.get_detail` builds this by calling `EnrollmentRepository.list_students_for_course`
  alongside the plain course lookup; `list`/create/update/delete still use the plain `CourseRead`
  schema without the students list.
- `GET /public/courses` (no auth) returns the same unfiltered `CourseRead` list as the
  authenticated `GET /courses` — see [[landing-page]]. There is no visitor-specific trimming;
  nothing on `Course` is sensitive.