# Enrollment

The join between a student and a course.

## Rules

- Many-to-many: a student can be enrolled in multiple courses; a course can have multiple students.
- Operations are add/delete only — no edit-in-place semantics. To change an enrollment, delete and re-add.
- Deleting an enrollment is the anchor point that [[payment-tracking]] and [[attendance]] records hang off — consider whether deletes should cascade or be blocked when related records exist.