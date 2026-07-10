# Exam

Schedule exams for a course. Implemented in `app/exams/` (see
[Backend architecture](../../CLAUDE.md#backend-architecture)) — routes require
`get_current_teacher`. The frontend `ExamsPage` (`frontend/src/pages/ExamsPage.tsx` +
`frontend/src/pages/exams/`) follows the same list-table + `Modal` create-form pattern as
[[payment-tracking]]/[[enrollment]]: a Zustand `examStore` (`fetchExams`/`createExam`/
`deleteExam` — add/delete only, no edit-in-place) backs a list table (`ExamTable`) that
resolves each exam's `course_id` to a course name via a lookup map built from `courseStore`.
Creating an exam happens in `ExamFormDialog` — a course `<select>`, a `datetime-local` input
for `exam_datetime`, an optional `description` textarea, and an `exam_mark` number input,
rendered in the default-width `Modal`. The "Add exam" action is disabled (via a client-side
check, not a backend rule) until at least one course exists, same pattern as payments/
enrollments' guard. There's a standalone "Exams" nav link/route (`/exams`), same as every
other list feature — this is not part of the Dashboard. `ExamTable` rows are clickable (same
pattern as `CourseTable`) and navigate to `ExamDetailPage` at route `/exams/:id` — a full page
showing a read-only exam card (course name, date/time, description, exam mark) plus a
[[mark]] sheet for recording each of the course's enrolled students' marks for that exam.
`GET /exams/{id}` (`ExamService.get_detail`) backs this page's initial fetch.

## Fields

- `course_id` — FK to `courses.id`, `ondelete="CASCADE"`
- `exam_datetime` — naive `DateTime` (no timezone), required — when the exam is scheduled.
  Deliberately not timezone-aware: it's fed directly from an HTML `datetime-local` input with
  no timezone conversion, unlike `created_at` (which stays timezone-aware like every other
  `created_at` column in this project).
- `description` — optional string
- `exam_mark` — positive integer — the exam's total/full mark (e.g. "out of 100"), not a
  per-student score. There's no per-student result tracking for exams yet.

## Rules

- `id` is a UUID primary key, like every other table in this project.
- Add/delete only, no edit-in-place (`POST`/`GET`/`DELETE`, no `PUT`/`PATCH`) — same as
  [[payment-tracking]] and [[enrollment]]'s base fields.
- No uniqueness constraint — a course can have multiple exams, including more than one on
  the same datetime (e.g. different subjects/sections aren't modeled, so this isn't blocked).
- Deleting a course cascades to delete its exams (`ondelete="CASCADE"`).
- Not tied to [[enrollment]] or student — an exam belongs to a course as a whole, not to
  individual enrolled students. Per-student results are tracked separately, in [[mark]].