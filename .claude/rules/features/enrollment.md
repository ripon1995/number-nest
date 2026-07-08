# Enrollment

The join between a student and a course. Implemented in `app/enrollments/` (see
[Backend architecture](../../CLAUDE.md#backend-architecture)) — routes require
`get_current_teacher`. The frontend `EnrollmentsPage` (`frontend/src/pages/EnrollmentsPage.tsx`
+ `frontend/src/pages/enrollments/`) consumes this end-to-end: a Zustand `enrollmentStore`
(`fetchEnrollments`/`createEnrollment`/`deleteEnrollment` — no update, matching the
add/delete-only API) backs a list table (`EnrollmentTable`). `EnrollmentRead` only returns
`student_id`/`course_id`, not nested objects, so `EnrollmentsPage` fetches [[students]] and
[[course]] lists too and builds client-side id→record lookup maps to resolve display names.
Creating an enrollment happens in `EnrollmentFormDialog` — student/course `<select>`s plus a
`start_from` date input, rendered in a `Modal` widened via an `enrollment-modal` class (the
generic `Modal` component gained an optional `className` prop for this). The "Add enrollment"
action is disabled (via a client-side check, not a backend rule) until at least one student
and one course exist.

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
  the anchor point that [[payment-tracking]] and [[attendance]] records hang off (both via an `enrollment_id`
  FK with `ondelete="CASCADE"`) — deleting an enrollment cascades to delete its payments and attendance records
  too, rather than being blocked when related records exist.
- [[course]]'s detail endpoint (`GET /courses/{id}`) surfaces a course's enrolled students via
  `EnrollmentRepository.list_students_for_course`, separately from the dedicated `EnrollmentsPage`
  list (the two are not backed by the same frontend query).
