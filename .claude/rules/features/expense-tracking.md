# Expense tracking

Records institutional costs the teacher has to maintain, separate from anything on the
student/enrollment side of the domain. Implemented in `app/expenses/` (see
[Backend architecture](../../CLAUDE.md#backend-architecture)) — routes require
`get_current_teacher`. The frontend `ExpensesPage` (`frontend/src/pages/ExpensesPage.tsx`
+ `frontend/src/pages/expenses/`) follows the same list-table + `Modal` create-form pattern
as [[payment-tracking]]/[[exam]]/[[notice]]: a Zustand `expenseStore`
(`fetchExpenses`/`createExpense`/`deleteExpense` — add/delete only, no edit-in-place) backs
a list table (`ExpenseTable`). Unlike every other feature, a single `Expense` row covers one
of **five** cost categories via a `category` field rather than five separate tables/pages —
`contract_fare`, `asset`, `salary`, `utility`, `other` — since one table + a category enum
keeps the CRUD surface, list page, and store to this one feature.

Above the table, `ExpensesPage` renders a filter bar — a category `<select>` plus a `month`
`<input type="month">` — that narrows the full `expenses` list client-side (filter state
lives in the page itself, not `expenseStore`), mirroring every other feature's filter bar.
The month filter matches against `expense_date` (the one field every category always sets),
**not** the category-specific `month` field, which only `contract_fare`/`salary` ever
populate — filtering on `month` directly would silently exclude every `asset`/`utility`/
`other` row. A "Clear filters" button appears once either filter is active, and
`ExpenseTable` shows a distinct "no expenses match the selected filters" message (via its
`emptyMessage` prop) instead of the normal empty-state copy when filters exclude everything.

Creating an expense happens in `ExpenseFormDialog` — a category `<select>` first, then
`amount`/`expense_date` (always shown) plus a set of fields that render conditionally based
on the chosen category, mirroring the backend validator below field-for-field: `month`
(`<input type="month">`) for `contract_fare`/`salary`; `staff_name` (text) for `salary`;
`direction` (Purchase/Sell `<select>`) + `description` (labelled "Asset / item") for `asset`;
`description` (labelled "Description") for `utility`/`other`. Rendered in the shared `Modal`
via an `expense-modal` className override, same technique [[enrollment]]/[[payment-tracking]]
use for their own dialogs.

## Fields

- `category` — enum: `contract_fare`, `asset`, `salary`, `utility`, `other`. Validated by a
  Pydantic enum (`ExpenseCategory` in `app/expenses/models.py`); stored as a plain string
  column, same non-native-enum choice as [[course]]'s `subject`/`class_level`/`batch_type`.
- `amount` — decimal (`Numeric(10, 2)`), must be >= 0
- `expense_date` — date, required — when the cost was actually incurred/paid. The one date
  field every category sets; used for sorting (`ExpenseRepository.list_all` orders by this,
  descending) and for the frontend's month filter (see above).
- `month` — nullable date (first-of-month, same shape as [[payment-tracking]]'s `month`) —
  required only for `contract_fare` and `salary`; must be absent for the other three
  categories. Which calendar month the recurring cost/salary covers.
- `staff_name` — nullable free-text string — required only for `salary`. No dedicated Staff
  model exists in this system (single-teacher app, no other staff records anywhere) — this
  is deliberately just a text field, not a foreign key.
- `direction` — enum (`AssetDirection`: `purchase`/`sell`), nullable — required only for
  `asset`, must be absent otherwise. Distinguishes buying an asset (a cost) from selling one
  (money coming back) within the same category.
- `description` — nullable free-text string — required for `asset` (what the asset/item is),
  `utility` (e.g. "Electricity", "Internet"), and `other` (freeform); optional/unused for
  `contract_fare`/`salary`, which already have `month`/`staff_name` for identity.

Field presence per category is enforced by a Pydantic `model_validator(mode="after")` on
`ExpenseCreate` (`app/expenses/schemas.py`) — not by the database, same choice [[course]]
makes for `course_days`' `min_length=1` — since which fields apply depends on `category`,
not something a plain column constraint can express.

## Rules

- `id` is a UUID primary key, like every other table in this project.
- Add/delete only, no edit-in-place (`POST`/`GET`/`DELETE`, no `PUT`/`PATCH`) — same as
  [[exam]]/[[notice]]/[[payment-tracking]].
- **Not tied to [[students]], [[course]], or [[enrollment]] at all** — the one feature in
  this system that isn't part of the student/enrollment domain. No FK anywhere on `Expense`.
- `contract_fare` is capped at one record per calendar month; `salary` is capped at one
  record per `(staff_name, month)` pair — enforced both in the service layer
  (`ExpenseService.create` pre-checks via `ExpenseRepository.get_contract_fare_for_month`/
  `get_salary_for_staff_month` and raises `ConflictException`, 409, before ever reaching the
  DB, same "friendly 409 first" pattern [[payment-tracking]]/[[enrollment]] use) and at the
  DB level via two **partial unique indexes** (`postgresql_where=`, the first use of this in
  the project's migrations — a plain composite `UniqueConstraint` can't express "unique only
  within one category" since the same `month`/`staff_name` columns are irrelevant to the
  other three categories):
  - `uq_expenses_contract_fare_month` — unique `month` where `category = 'contract_fare'`
  - `uq_expenses_salary_staff_month` — unique `(staff_name, month)` where `category = 'salary'`
- `asset`, `utility`, and `other` have no such cap — any number of records per month.
- No cascading deletes involved — `Expense` has no foreign keys to cascade from or to.
