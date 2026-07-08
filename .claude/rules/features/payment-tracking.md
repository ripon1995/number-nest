# Payment tracking

Manually record payments against a student's course enrollment. Implemented in
`app/payments/` (see [Backend architecture](../../CLAUDE.md#backend-architecture)) — routes
require `get_current_teacher`. The frontend `PaymentsPage` (`frontend/src/pages/PaymentsPage.tsx`
+ `frontend/src/pages/payments/`) consumes this end-to-end, mirroring [[enrollment]]'s
list-table + `Modal` create-form pattern: a Zustand `paymentStore`
(`fetchPayments`/`createPayment`/`deletePayment` — add/delete only, matching the
add/delete-only API) backs a list table (`PaymentTable`). `PaymentRead` only returns
`enrollment_id`, not nested objects, so `PaymentsPage` fetches [[enrollment]], [[students]],
and [[course]] lists too and resolves a payment's student/course names via a two-hop lookup
(`enrollment_id` → enrollment → `student_id`/`course_id` → name). Creating a payment happens
in `PaymentFormDialog` — a single enrollment `<select>` (labelled `"{student} — {course}"`,
built from those same lookups) plus `month` (`<input type="month">`, converted to the
first-of-month date `YYYY-MM-01` on submit), `payment_date`, and `amount` inputs, rendered in
a `Modal`. The "Add payment" action is disabled (via a client-side check, not a backend rule)
until at least one enrollment exists.

## Fields

- `enrollment_id` — FK to `enrollments.id`, `ondelete="CASCADE"` (not `student_id`/`course_id`
  directly — see Rules below)
- `month` — date, required, stored as the first of the month (e.g. `2026-07-01`) — which
  billing month this payment covers
- `payment_date` — date, required — when the payment was actually made
- `amount` — decimal (`Numeric(10, 2)`), must be >= 0

## Rules

- `id` is a UUID primary key, like every other table in this project.
- Manual/offline tracking only — no payment gateway integration, no automated billing.
- Payments hang off the student-course [[enrollment]] via `enrollment_id`, not `student_id`/
  `course_id` directly — resolving a payment to a student/course always goes through the
  enrollment. This also means a payment can't be recorded for a student/course pair that
  isn't actually enrolled.
- One payment per `(enrollment_id, month)` — enforced by a DB unique constraint
  (`uq_payments_enrollment_month`) plus a service-layer `ConflictException` (409) check in
  `PaymentService.record`. Correcting a month's payment means delete and re-add (add/delete
  only, no `PUT`), same as [[enrollment]] — this does *not* support partial/installment
  payments within the same month.
- Deleting an enrollment cascades to delete its payments (`ondelete="CASCADE"`).
