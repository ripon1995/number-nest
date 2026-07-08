# Enrollment

The join between a student and a course. Implemented in `app/enrollments/` (see
[Backend architecture](../../CLAUDE.md#backend-architecture)) — routes require
`get_current_teacher`.

## Fields

- `student_id` — FK to `students.id`, `ondelete="CASCADE"`
- `course_id` — FK to `courses.id`, `ondelete="CASCADE"`
- `start_from` — date, required, provided by the teacher (not auto-set) — when the enrollment starts

## Rules

- `id` is a UUID primary key, like every other table in this project.
- Many-to-many: a student can be enrolled in multiple courses; a course can have multiple students.
- Operations are add/delete only — no edit-in-place semantics (`POST`/`GET`/`DELETE`, no `PUT`). To change an
  enrollment, delete and re-add.
- A student can't be enrolled in the same course twice — enforced by a DB unique constraint on
  `(student_id, course_id)` plus a service-layer `ConflictException` (409) check in `EnrollmentService.enroll`.
- Deleting a student or course cascades to their enrollments (`ondelete="CASCADE"`). Deleting an enrollment is
  the anchor point that [[payment-tracking]] and [[attendance]] records will hang off once those features exist —
  consider whether those deletes should cascade or be blocked when related records exist.
- [[course]]'s detail endpoint (`GET /courses/{id}`) surfaces a course's enrolled students via
  `EnrollmentRepository.list_students_for_course`, not through a dedicated enrollments UI yet.
