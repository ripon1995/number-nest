# Exam

Schedule exams for a course. Implemented in `app/exams/` (see
[Backend architecture](../../CLAUDE.md#backend-architecture)) — routes require
`get_current_teacher`. The frontend `ExamsPage` (`frontend/src/pages/ExamsPage.tsx` +
`frontend/src/pages/exams/`) follows the same list-table + `Modal` create/edit-form pattern
as [[course]]: a Zustand `examStore` (`fetchExams`/`createExam`/`updateExam`/`deleteExam`)
backs a list table (`ExamTable`) that resolves each exam's `course_id` to a course name via
a lookup map built from `courseStore`. `ExamFormDialog` handles both creating and editing —
it takes an optional `exam` prop; when present, the form is pre-filled from it and the
course `<select>` is rendered `disabled` (see Rules below for why course can't change).
Fields: a course `<select>`, a `datetime-local` input for `exam_datetime`, an optional
`description` textarea, and an `exam_mark` number input, rendered in the default-width
`Modal`. The "Add exam" action is disabled (via a client-side check, not a backend rule)
until at least one course exists, same pattern as payments/enrollments' guard. There's a
standalone "Exams" nav link/route (`/exams`), same as every other list feature — this is not
part of the Dashboard.

`ExamTable` rows carry edit/delete icon actions (`PencilIcon`/`TrashIcon` in
`ExamIcons.tsx`) and are also clickable as a whole row (same pattern as `CourseTable`,
`stopPropagation()` on both action buttons so clicking them doesn't also trigger row
navigation) — clicking anywhere else on the row navigates to `ExamDetailPage` at route
`/exams/:id` — a full page showing a read-only exam card (course name, date/time,
description, exam mark) plus a [[mark]] sheet for recording each of the course's enrolled
students' marks for that exam. `GET /exams/{id}` (`ExamService.get_detail`) backs this
page's initial fetch. `ExamDetailPage` stays read-only for the exam itself — editing is the
list table's pencil icon, not something available from the detail page, same
"detail page is a pure view, list table icons are the mutation entry points" split
[[course]]/[[students]] use.

## Fields

- `course_id` — FK to `courses.id`, `ondelete="CASCADE"`. Immutable after creation — see
  Rules below.
- `exam_datetime` — naive `DateTime` (no timezone), required — when the exam is scheduled.
  Deliberately not timezone-aware: it's fed directly from an HTML `datetime-local` input with
  no timezone conversion, unlike `created_at` (which stays timezone-aware like every other
  `created_at` column in this project).
- `description` — optional string
- `exam_mark` — positive integer — the exam's total/full mark (e.g. "out of 100"), not a
  per-student score. There's no per-student result tracking for exams yet.

## Rules

- `id` is a UUID primary key, like every other table in this project.
- Add/edit/delete — `PUT /exams/{id}` (`ExamService.update`, `ExamRepository.update`) lets
  `exam_datetime`/`description`/`exam_mark` be edited in place via a dedicated `ExamUpdate`
  schema. `course_id` is **not** part of `ExamUpdate` at all (unlike [[expense-tracking]]'s
  `category`, which stays in the payload purely for a service-side immutability check —
  there's no equivalent conditional-field validation here, so it's simplest to just omit the
  field entirely) and can't be changed after creation: [[mark]] records are recorded against
  the exam's course roster (`ExamDetailPage`'s mark sheet is built from the exam's
  `course_id` at fetch time), so reassigning the course after marks exist would leave old
  marks pointing at students who no longer show up on the mark sheet. Delete and re-add
  instead if the course itself was wrong.
- No uniqueness constraint — a course can have multiple exams, including more than one on
  the same datetime (e.g. different subjects/sections aren't modeled, so this isn't blocked).
- Deleting a course cascades to delete its exams (`ondelete="CASCADE"`).
- Not tied to [[enrollment]] or student — an exam belongs to a course as a whole, not to
  individual enrolled students. Per-student results are tracked separately, in [[mark]].
