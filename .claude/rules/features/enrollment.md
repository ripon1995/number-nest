# Enrollment

The join between a student and a course. Implemented in `app/enrollments/` (see
[Backend architecture](../../CLAUDE.md#backend-architecture)) — routes require
`get_current_teacher`. The frontend `EnrollmentsPage` (`frontend/src/pages/EnrollmentsPage.tsx`
+ `frontend/src/pages/enrollments/`) consumes this end-to-end: a Zustand `enrollmentStore`
(`fetchEnrollments`/`createEnrollment`/`updateEnrollmentFeePaid`/`deleteEnrollment` — no
general update, matching the add/delete-only API, aside from the narrow fee-paid toggle
described below) backs a list table (`EnrollmentTable`). `EnrollmentRead` only returns
`student_id`/`course_id`, not nested objects, so `EnrollmentsPage` fetches [[students]] and
[[course]] lists too and builds client-side id→record lookup maps to resolve display names.
Creating an enrollment happens in `EnrollmentFormDialog` — student/course `<select>`s, a
`start_from` date input, and an "Enrollment fee paid" checkbox (defaults unchecked), rendered
in a `Modal` widened via an `enrollment-modal` class (the generic `Modal` component gained an
optional `className` prop for this). The "Add enrollment" action is disabled (via a
client-side check, not a backend rule) until at least one student and one course exist.
`EnrollmentTable` renders `enrollment_fee_paid` as a checkbox per row (not read-only) — toggling
it calls `updateEnrollmentFeePaid`, which hits the dedicated `PATCH` endpoint described below.

## Fields

- `student_id` — FK to `students.id`, `ondelete="CASCADE"`
- `course_id` — FK to `courses.id`, `ondelete="CASCADE"`
- `start_from` — date, required, provided by the teacher (not auto-set) — when the enrollment starts
- `enrollment_fee_paid` — boolean, defaults to `False`. Tracks whether the student has paid
  [[course]]'s `enrollment_fee` for this enrollment. Settable at creation time
  (`EnrollmentCreate.enrollment_fee_paid`, default `False`) and updatable afterwards — see the
  `PATCH` carve-out below.

## Rules

- `id` is a UUID primary key, like every other table in this project.
- Many-to-many: a student can be enrolled in multiple courses; a course can have multiple students.
- Operations are otherwise add/delete only — no edit-in-place semantics for `student_id`/`course_id`/
  `start_from` (`POST`/`GET`/`DELETE`, no general `PUT`). To change one of those fields, delete and
  re-add. The one deliberate exception is `enrollment_fee_paid`: `PATCH /enrollments/{id}/fee-paid`
  (`EnrollmentFeeUpdate` schema, `EnrollmentService.set_fee_paid`) updates just that column in place.
  This carve-out exists because delete/re-add would cascade-delete the enrollment's [[payment-tracking]]
  and [[attendance]] history just to flip a boolean, which is worse than a narrow mutable exception to
  the add/delete-only rule.
- A student can't be enrolled in the same course twice — enforced by a DB unique constraint on
  `(student_id, course_id)` plus a service-layer `ConflictException` (409) check in `EnrollmentService.enroll`.
- Deleting a student or course cascades to their enrollments (`ondelete="CASCADE"`). Deleting an enrollment is
  the anchor point that [[payment-tracking]] and [[attendance]] records hang off (both via an `enrollment_id`
  FK with `ondelete="CASCADE"`) — deleting an enrollment cascades to delete its payments and attendance records
  too, rather than being blocked when related records exist.
- [[course]]'s detail endpoint (`GET /courses/{id}`) surfaces a course's enrolled students via
  `EnrollmentRepository.list_students_for_course`, separately from the dedicated `EnrollmentsPage`
  list (the two are not backed by the same frontend query).
