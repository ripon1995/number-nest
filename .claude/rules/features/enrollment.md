# Enrollment

The join between a student and a course. Implemented in `app/enrollments/` (see
[Backend architecture](../../CLAUDE.md#backend-architecture)) — routes require
`get_current_teacher`. The frontend `EnrollmentsPage` (`frontend/src/pages/EnrollmentsPage.tsx`
+ `frontend/src/pages/enrollments/`) consumes this end-to-end: a Zustand `enrollmentStore`
(`fetchEnrollments`/`createEnrollment`/`updateEnrollmentFeePaid`/`updateEnrollmentDiscontinued`/
`deleteEnrollment` — no general update, matching the add/delete-only API, aside from the two
narrow carve-outs described below) backs a list table (`EnrollmentTable`). `EnrollmentRead` only returns
`student_id`/`course_id`, not nested objects, so `EnrollmentsPage` fetches [[students]] and
[[course]] lists too and builds client-side id→record lookup maps to resolve display names.
Creating an enrollment happens in `EnrollmentFormDialog` — student/course `<select>`s, a
`start_from` date input, and an "Enrollment fee paid" checkbox (defaults unchecked), rendered
in a `Modal` widened via an `enrollment-modal` class (the generic `Modal` component gained an
optional `className` prop for this). The "Add enrollment" action is disabled (via a
client-side check, not a backend rule) until at least one student and one course exist.
`EnrollmentTable` renders `enrollment_fee_paid` as a checkbox per row (not read-only) — toggling
it calls `updateEnrollmentFeePaid`, which hits the dedicated `PATCH` endpoint described below.
`EnrollmentTable` also renders `discontinued_at` as a per-row `<input type="date">` (empty =
active) — changing it calls `updateEnrollmentDiscontinued`, hitting `PATCH
/enrollments/{id}/discontinue`; clearing the date back to empty reactivates the enrollment.
This is the only place in the app that sets or clears `discontinued_at` — `StudentDetailPage`
shows the resulting status read-only (see [[students]]) but never edits it.

Above the table, `EnrollmentsPage` also renders a filter bar — course and student `<select>`s —
that narrows the full `enrollments` list client-side before handing it to `EnrollmentTable`
(filter state lives in the page itself, not `enrollmentStore`), mirroring
[[payment-tracking]]'s filter bar. Since `Enrollment` carries `student_id`/`course_id` directly,
the filters match straight against those fields — no lookup-through-enrollment hop like
payments needs. This is a pure frontend filter — there's no backend query param support on
`GET /enrollments` to call into. A "Clear filters" button appears once either filter is active,
and `EnrollmentTable` shows a distinct "no enrollments match the selected filters" message (via
its `emptyMessage` prop) instead of the normal empty-state copy when filters exclude everything.

## Fields

- `student_id` — FK to `students.id`, `ondelete="CASCADE"`
- `course_id` — FK to `courses.id`, `ondelete="CASCADE"`
- `start_from` — date, required, provided by the teacher (not auto-set) — when the enrollment starts
- `enrollment_fee_paid` — boolean, defaults to `False`. Tracks whether the student has paid
  [[course]]'s `enrollment_fee` for this enrollment. Settable at creation time
  (`EnrollmentCreate.enrollment_fee_paid`, default `False`) and updatable afterwards — see the
  `PATCH` carve-out below.
- `discontinued_at` — nullable date, defaults to `NULL` (active). A date instead of a boolean so
  due-generation has an actual cutoff month to stop at, and so the teacher can backdate it if a
  student actually stopped before the record is updated. Not settable at creation — only via the
  `PATCH /enrollments/{id}/discontinue` carve-out below. `NULL` = active, a date = discontinued as
  of that date; clearing it back to `NULL` reactivates the enrollment (not a new `Enrollment` row —
  the `(student_id, course_id)` unique constraint wouldn't allow one anyway).

## Rules

- `id` is a UUID primary key, like every other table in this project.
- Many-to-many: a student can be enrolled in multiple courses; a course can have multiple students.
- Operations are otherwise add/delete only — no edit-in-place semantics for `student_id`/`course_id`/
  `start_from` (`POST`/`GET`/`DELETE`, no general `PUT`). To change one of those fields, delete and
  re-add. There are two deliberate exceptions. `enrollment_fee_paid`: `PATCH /enrollments/{id}/fee-paid`
  (`EnrollmentFeeUpdate` schema, `EnrollmentService.set_fee_paid`) updates just that column in place.
  `discontinued_at`: `PATCH /enrollments/{id}/discontinue` (`EnrollmentDiscontinueUpdate` schema,
  `EnrollmentService.set_discontinued`) updates just that column in place, either setting it (mark
  discontinued) or clearing it back to `NULL` (reactivate). Both carve-outs exist because delete/re-add
  would cascade-delete the enrollment's [[payment-tracking]] and [[attendance]] history just to flip a
  field, which is worse than a narrow mutable exception to the add/delete-only rule.
- Discontinuing an enrollment does not delete or hide it from `GET /enrollments` — `EnrollmentsPage`
  and `StudentDetailPage` still see it (and its full payment/attendance/mark history), so the teacher
  can review or reactivate it later. Only [[course]]'s enrolled-student roster (see below) excludes
  discontinued enrollments. [[students]]'s `buildDuePayments` stops generating new due months once past
  `discontinued_at`'s month (the discontinuation month itself still counts as due) — reactivating
  clears that cap and resumes normal generation from `start_from`, which can re-flag months during the
  paused window as due unless already marked paid; that's a known limitation, not solved here.
- A student can't be enrolled in the same course twice — enforced by a DB unique constraint on
  `(student_id, course_id)` plus a service-layer `ConflictException` (409) check in `EnrollmentService.enroll`.
- Deleting a student or course cascades to their enrollments (`ondelete="CASCADE"`). Deleting an enrollment is
  the anchor point that [[payment-tracking]] and [[attendance]] records hang off (both via an `enrollment_id`
  FK with `ondelete="CASCADE"`) — deleting an enrollment cascades to delete its payments and attendance records
  too, rather than being blocked when related records exist.
- [[course]]'s detail endpoint (`GET /courses/{id}`) surfaces a course's enrolled students via
  `EnrollmentRepository.list_students_for_course`, separately from the dedicated `EnrollmentsPage`
  list (the two are not backed by the same frontend query). `list_students_for_course` filters to
  `discontinued_at IS NULL` — a discontinued student drops out of the course's roster (and, as a
  result, out of [[attendance]]'s and [[mark]]'s student sheets too, since both fetch their roster
  via the same `CourseDetailRead.students`), even though their `Enrollment` row still exists.
