# Teacher

Create and manage teacher records.

## Fields

- name
- contact info (phone/email)
- (add fields as schema solidifies — keep this list in sync)

## Rules

- A teacher can be assigned to multiple courses; a course can have multiple teachers (many-to-many via a course-teacher assignment, analogous to [[enrollment]]).
- No payment or attendance tracking hangs off teachers in the current scope — [[payment-tracking]] and [[attendance]] are student-course concerns only.