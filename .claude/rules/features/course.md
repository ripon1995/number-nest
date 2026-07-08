# Course

Create and manage courses.

## Fields

- name
- schedule
- fee
- (add fields as schema solidifies — keep this list in sync)

## Rules

- A course can have multiple students enrolled (many-to-many via enrollment, see [[enrollment]]).
- A course can have multiple teachers assigned (see [[teacher]]).
- No payment gateway logic lives here — fee is just the amount used by [[payment-tracking]] when recording manual payments.