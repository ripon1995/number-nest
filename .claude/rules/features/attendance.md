# Attendance

Record attendance per student per course session. Implemented in `app/attendance/` (see
[Backend architecture](../../CLAUDE.md#backend-architecture)) — routes require
`get_current_teacher`. Unlike every other feature, there is no manual single-record add
form — attendance is always recorded a whole course session at a time via an "attendance
sheet": the frontend `AttendancePage` (`frontend/src/pages/AttendancePage.tsx` +
`frontend/src/pages/attendance/`) has a course `<select>` (from `courseStore`) and a
`session_date` input (defaulted to today); selecting a course fetches that course's enrolled
students via `api.getCourse` (`CourseDetailRead.students` — not `courseStore`, whose plain
`Course` items don't carry the student list) and renders `AttendanceSheet`, a table of those
students with a present/absent checkbox per row. Submitting posts the whole sheet as one
`POST /attendance/bulk` call (`AttendanceBulkCreate`: `course_id`, `session_date`, and a list
of `{student_id, present}` entries) via the Zustand `attendanceStore`
(`fetchAttendance`/`submitAttendance`). `AttendanceService.record_bulk` resolves each
`student_id` to its enrollment via `EnrollmentRepository.get_by_student_and_course`, then
**upserts** the `(enrollment_id, session_date)` row (update `present` if a record already
exists, else create) — re-submitting for a date that already has records does not conflict.
This makes the `session_date` field double as a way to revisit and correct a prior session:
re-selecting a past date fetches its existing records via `GET /attendance` (required
`course_id`, optional `session_date` query params) to prefill the sheet's checkboxes before
resubmission.

## Fields

- `enrollment_id` — FK to `enrollments.id`, `ondelete="CASCADE"`
- `session_date` — date, required — which session this record belongs to
- `present` — boolean, required (present/absent only — no late/excused states)

`AttendanceRead` (the response schema) also includes a `student_id` field that is *not* a
column on the `Attendance` model — it's populated by joining `Enrollment` (in
`AttendanceRepository.list_for_course`, or directly from the request payload in
`record_bulk`) so the frontend can match each record back to a student without a second
fetch.

## Rules

- `id` is a UUID primary key, like every other table in this project.
- Attendance hangs off the student-course [[enrollment]] via `enrollment_id`, not the student
  or course alone — resolving a bulk-submit entry's `student_id` + the sheet's `course_id` to
  an enrollment reuses `EnrollmentRepository.get_by_student_and_course`, and raises
  `NotFoundException` if the student isn't actually enrolled in that course.
- One record per `(enrollment_id, session_date)` — enforced by a DB unique constraint
  (`uq_attendance_enrollment_session_date`). Unlike every other add/delete-only feature in
  this project, resubmitting for an existing `(enrollment, session_date)` **updates** the
  existing row instead of raising a conflict — see the upsert behavior described above.
- Deleting an enrollment cascades to delete its attendance records (`ondelete="CASCADE"`).
- `DELETE /attendance/{id}` exists for removing a single record, but there's no dedicated
  history-browsing UI for it yet — out of scope for the initial implementation.
