# Notice

Post event notices tied to a course. Implemented in `app/notices/` (see
[Backend architecture](../../CLAUDE.md#backend-architecture)) — routes require
`get_current_teacher`. The frontend `NoticesPage` (`frontend/src/pages/NoticesPage.tsx` +
`frontend/src/pages/notices/`) follows the same list-table + `Modal` create-form pattern as
[[exam]]: a Zustand `noticeStore` (`fetchNotices`/`createNotice`/`deleteNotice` — add/delete
only, no edit-in-place) backs a list table (`NoticeTable`) that resolves each notice's
`course_id` to a course name via a lookup map built from `courseStore`. Creating a notice
happens in `NoticeFormDialog` — `event_name`/`event_place` text inputs, a `datetime-local`
input for `event_datetime`, and a course `<select>`, rendered in the default-width `Modal`.
The "Add notice" action is disabled (via a client-side check, not a backend rule) until at
least one course exists, same pattern as [[exam]]'s guard. There's a standalone "Notices" nav
link/route (`/notices`), same as every other list feature — this is not part of the Dashboard.

## Fields

- `event_name` — string, required
- `event_place` — string, required
- `event_datetime` — naive `DateTime` (no timezone), required — when the event happens. Same
  deliberate no-timezone choice as [[exam]]'s `exam_datetime`, for the same reason (fed
  directly from a `datetime-local` input).
- `course_id` — FK to `courses.id`, `ondelete="CASCADE"`

## Rules

- `id` is a UUID primary key, like every other table in this project.
- Add/delete only, no edit-in-place (`POST`/`GET`/`DELETE`, no `PUT`/`PATCH`) — same as
  [[exam]].
- No uniqueness constraint — a course can have multiple notices, including overlapping ones.
- Deleting a course cascades to delete its notices (`ondelete="CASCADE"`).
- Not tied to [[enrollment]] or student — a notice belongs to a course as a whole, not to
  individual enrolled students.