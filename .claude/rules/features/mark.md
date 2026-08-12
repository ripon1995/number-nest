# Mark

Records a student's obtained mark for one exam. Implemented in `app/marks/` (see
[Backend architecture](../../CLAUDE.md#backend-architecture)) — routes require
`get_current_user`, with mutating routes additionally requiring `require_admin` (see
[[teacher]]/[[role-based-access]]). Unlike [[exam]] and [[notice]], there is no manual single-record add
form — marks are always recorded a whole exam's mark sheet at a time, mirroring
[[attendance]]'s bulk-upsert pattern exactly: the frontend `ExamDetailPage`
(`frontend/src/pages/exams/ExamDetailPage.tsx`, route `/exams/:id`, reached by clicking a row
in `ExamTable`) fetches the exam via `api.getExam(id)`, then the exam's course (and its
enrolled students) via `api.getCourse(exam.course_id)` — the same `CourseDetailRead.students`
source [[attendance]] uses, not a separate `Mark`-specific student list. It renders a `MarkSheet`
— a table of those students with a CQ and an MCQ numeric mark input per row (split from a
single mark input — see Fields below), prefilled from any existing marks for that exam via
the Zustand `markStore`'s `fetchMarks`, and submitted as one
`POST /marks/bulk` call via `submitMarks` (`MarkBulkCreate`: `exam_id` and a list of
`{student_id, cq, mcq}` entries) — resubmitting for the same exam upserts each row rather than
erroring, so revisiting the exam's detail page doubles as a way to correct previously entered
marks.

## Fields

- `enrollment_id` — FK to `enrollments.id`, `ondelete="CASCADE"` — not `student_id` directly,
  matching [[payment-tracking]] and [[attendance]]'s convention of hanging per-student records
  off the enrollment rather than the student.
- `exam_id` — FK to `exams.id`, `ondelete="CASCADE"`
- `cq` — non-negative integer — the student's obtained mark on the CQ (Creative Question)
  section. Originally a single `mark` field; split into `cq`/`mcq` (see `mcq` below) to match
  [[exam]]'s `cq_mark`/`mcq_mark` split — a migration renamed the existing `mark` column to
  `cq` (preserving prior values as the CQ figure) and backfilled a new `mcq` column to 0 for
  pre-existing rows. Not validated against [[exam]]'s `cq_mark` (that section's total) — a
  value greater than the exam's total isn't blocked.
- `mcq` — non-negative integer — the student's obtained mark on the MCQ section, same
  treatment as `cq` above (not validated against `mcq_mark`).

`MarkRead` (the response schema) also includes a `student_id` field that is *not* a column on
the `Mark` model — populated by joining `Enrollment` (in `MarkRepository.list_for_exam`, or
directly from the request payload in `record_bulk`), same technique [[attendance]] uses for
`AttendanceRead.student_id`.

## Rules

- `id` is a UUID primary key, like every other table in this project.
- One record per `(enrollment_id, exam_id)` — enforced by a DB unique constraint
  (`uq_marks_enrollment_exam`). Resubmitting the mark sheet for an exam **updates** existing
  rows instead of raising a conflict, same upsert behavior as [[attendance]].
- Resolving a bulk-submit entry's `student_id` + the exam's `course_id` (looked up via
  `ExamRepository.get_by_id`) to an enrollment reuses
  `EnrollmentRepository.get_by_student_and_course`, and raises `NotFoundException` if the
  student isn't actually enrolled in that exam's course.
- Deleting an enrollment or an exam cascades to delete its marks (`ondelete="CASCADE"`).
- `DELETE /marks/{id}` exists for removing a single record, but there's no dedicated UI for it
  yet (same as [[attendance]]'s single-record delete) — out of scope for the initial
  implementation.