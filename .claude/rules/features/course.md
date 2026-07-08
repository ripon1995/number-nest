# Course

Create and manage courses. Implemented as full CRUD in `app/courses/` (see
[Backend architecture](../../CLAUDE.md#backend-architecture)) — routes require
`get_current_teacher`. The frontend `CoursesPage` (`frontend/src/pages/CoursesPage.tsx`
+ `frontend/src/pages/courses/`) consumes this end-to-end: list/create/update/delete
go through a Zustand `courseStore`, and creating/editing a course happens in a `Modal`
dialog. Viewing a course is not a modal — clicking a row in `CourseTable` navigates to
`CourseDetailPage` at route `/courses/:id`, a full page showing a read-only course card
plus a table of the course's enrolled students (see [[enrollment]]).

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
  fields plus `students: StudentRead[]`, the list of currently enrolled [[students]].
  `CourseService.get_detail` builds this by calling `EnrollmentRepository.list_students_for_course`
  alongside the plain course lookup; `list`/create/update/delete still use the plain `CourseRead`
  schema without the students list.