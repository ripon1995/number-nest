# Students

Create and manage student records. Implemented as full CRUD in `app/students/` (see
[Backend architecture](../../CLAUDE.md#backend-architecture)) — routes require
`get_current_teacher`.

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
- No dedicated frontend Students page yet — students are currently only visible read-only, embedded in a course's
  enrolled-student list on [[course]]'s detail page.