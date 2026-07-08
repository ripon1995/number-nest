# Students

Create and manage student records.

## Fields

- name
- contact info (phone/email)
- (add fields as schema solidifies — keep this list in sync)

## Rules

- A student can be enrolled in multiple courses (many-to-many via enrollment, see [[enrollment]]).
- Payments ([[payment-tracking]]) and attendance ([[attendance]]) hang off the student-course enrollment, not the student directly.