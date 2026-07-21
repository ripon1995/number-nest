# Students

Create and manage student records. Implemented as full CRUD in `app/students/` (see
[Backend architecture](../../CLAUDE.md#backend-architecture)) — routes require
`get_current_teacher`. The frontend `StudentsPage` (`frontend/src/pages/StudentsPage.tsx`
+ `frontend/src/pages/students/`) consumes this end-to-end, mirroring [[course]]'s
list-table + `Modal` create/edit-form pattern: list/create/update/delete go through a
Zustand `studentStore`, and creating/editing a student happens in a `Modal` dialog
(`StudentFormDialog`). `StudentTable` rows also carry a detail icon (`EyeIcon` in
`StudentIcons.tsx`, alongside the edit/delete icons) that navigates to `StudentDetailPage`
(route `/students/:id`, `frontend/src/pages/students/StudentDetailPage.tsx`) — a full page,
not a modal, fetched via `api.getStudent(id)` (`GET /students/{id}`; the backend route
already existed but had no frontend caller before this page). It renders three cards: a
student-information card (contact fields plus an inline table of the student's [[enrollment]]s
— course name, `start_from`, `enrollment_fee_paid` — resolved via `enrollmentStore`/
`courseStore` lookup maps, same technique `EnrollmentTable` uses); a due-payments card; and a
payment-history card listing the student's actual [[payment-tracking]] records across all
their enrollments, newest month first.

Above the table, `StudentsPage` also renders a filter bar — a single course `<select>` — that
narrows the full `students` list client-side before handing it to `StudentTable` (filter state
lives in the page itself, not `studentStore`), mirroring [[enrollment]]'s and
[[payment-tracking]]'s filter bars. Since `Student` carries no `course_id` of its own, the
filter instead checks whether any of the student's `enrollmentStore` entries has the selected
`course_id` — a lookup-through-enrollment, same as [[payment-tracking]]'s filter needs (unlike
[[enrollment]]'s, which matches directly). This is a pure frontend filter — there's no backend
query param support on `GET /students` to call into. A "Clear filters" button appears once the
filter is active, and `StudentTable` shows a distinct "no students match the selected filter"
message (via its `emptyMessage` prop, defaulting to `'No students yet.'`) instead of the normal
empty-state copy when the filter excludes everything.

## Detail page due calculation

`studentDetailDisplay.ts`'s `buildDuePayments` computes the due-payments card entirely
client-side, over data already fetched into `enrollmentStore`/`courseStore`/`paymentStore` —
there is no backend "dues" endpoint or model. For each of the student's enrollments, it walks
every calendar month from that enrollment's `start_from` through the current month
(inclusive) and, for any month with no matching [[payment-tracking]] record (`enrollment_id`
plus the `YYYY-MM` prefix of `payment.month`), lists it as due at that [[course]]'s
`course_fee` — the recurring fee, not the one-time `enrollment_fee`. Whether the
`enrollment_fee` has been paid is shown separately, via `enrollment_fee_paid` in the same
page's enrollments table, not folded into the due-payments list. If the enrollment carries a
[[enrollment]] `discontinued_at`, the month walk stops there instead of at the current month
(the discontinuation month itself still counts as due) — a discontinued student stops
accruing new dues, while months already elapsed before discontinuation still show up if
unpaid. The same enrollments table also gains a read-only "Status" column
(`Active`/`Discontinued since {date}`) so it's clear why a student's dues stopped growing;
`StudentDetailPage` never edits `discontinued_at` itself, only `EnrollmentsPage` does (see
[[enrollment]]).

## Fields

- `name` — string, required
- `college` — optional string
- `contact` — string, required
- `email` — optional string
- `whatsapp_number` — string, required

## Rules

- `id` is a UUID primary key, like every other table in this project.
- A student can be enrolled in multiple courses (many-to-many via enrollment, see [[enrollment]]).
- Payments ([[payment-tracking]]) and attendance ([[attendance]]) hang off the student-course enrollment, not the student directly.
- Students are also visible read-only, embedded in a course's enrolled-student list on [[course]]'s detail page, and
  selectable by name in [[enrollment]]'s create form.
- `StudentDetailPage` is entirely read-only — nothing on it edits/creates/deletes a student, enrollment, or payment;
  it's a view built from data already owned by [[enrollment]] and [[payment-tracking]], same as [[course]]'s detail
  page is read-only over enrollment data.