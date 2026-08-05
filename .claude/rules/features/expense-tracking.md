# Expense tracking

Records institutional costs the teacher has to maintain, separate from anything on the
student/enrollment side of the domain. Implemented in `app/expenses/` (see
[Backend architecture](../../CLAUDE.md#backend-architecture)) — routes require
`get_current_teacher`. The frontend `ExpensesPage` (`frontend/src/pages/ExpensesPage.tsx`
+ `frontend/src/pages/expenses/`) follows the same list-table + `Modal` create/edit-form
pattern as [[course]]/[[students]]: a Zustand `expenseStore`
(`fetchExpenses`/`createExpense`/`updateExpense`/`deleteExpense`) backs a list table
(`ExpenseTable`). Unlike every other feature, a single `Expense` row covers one of **six**
cost categories via a `category` field rather than six separate tables/pages —
`house_rent`, `asset`, `salary`, `electricity`, `internet`, `other` — since one table + a
category enum keeps the CRUD surface, list page, and store to this one feature. `house_rent`
was originally named `contract_fare`; it was renamed backend-and-frontend (model enum,
column data, partial-unique-index name/condition) via `migrations/versions/
f7e5966ac126_rename_expense_date_and_house_rent_....py`, the same migration that renamed
`expense_date` to `payment_date` and added `paid_to`/`paid_by` (see Fields below). A single
`utility` category originally covered `electricity`/`internet` together; it was split into
the two via `migrations/versions/e68207ebe0d0_split_utility_into_electricity_and_....py`,
which data-migrates existing `utility` rows to `electricity` (the only rows that existed at
split time were electric-bill entries, so the mapping was unambiguous — a DB with mixed
utility rows wouldn't have this guarantee, which is why this was a one-off data decision, not
a generic rule).

Above the table, `ExpensesPage` renders a filter bar — a category `<select>` plus a `month`
`<input type="month">` — that narrows the full `expenses` list client-side (filter state
lives in the page itself, not `expenseStore`), mirroring every other feature's filter bar.
The month filter matches against `payment_date` (the one field every category always sets),
**not** the category-specific `month` field, which only `house_rent`/`salary` ever
populate — filtering on `month` directly would silently exclude every
`asset`/`electricity`/`internet`/`other` row. A "Clear filters" button appears once either
filter is active, and
`ExpenseTable` shows a distinct "no expenses match the selected filters" message (via its
`emptyMessage` prop) instead of the normal empty-state copy when filters exclude everything.

`ExpenseFormDialog` handles both creating and editing — it takes an optional `expense` prop;
when present, the form is pre-filled from it and the category `<select>` is rendered
`disabled` (see Rules below for why category can't change). Fields: a category `<select>`
first, then `amount`/`payment_date`/`paid_to`/`paid_by` (always shown) plus a set of fields
that render conditionally based on the chosen category, mirroring the backend validator
below field-for-field: `month` (`<input type="month">`) for `house_rent`/`salary`;
`staff_name` (text) for `salary`; `direction` (Purchase/Sell `<select>`) + `description`
(labelled "Asset / item") for `asset`; `description` (labelled "Description") for
`electricity`/`internet`/`other`. Rendered in the shared `Modal` via an `expense-modal`
className override, same technique [[enrollment]]/[[payment-tracking]] use for their own
dialogs.

`ExpenseTable` rows carry detail/edit/delete icon actions (`EyeIcon`/`PencilIcon`/`TrashIcon`
in `ExpenseIcons.tsx`, same three-icon pattern [[students]]' `StudentTable` uses). The detail
icon navigates to `ExpenseDetailPage` (route `/expenses/:id`,
`frontend/src/pages/expenses/ExpenseDetailPage.tsx`) — a full page, not a modal, fetched via
a new `api.getExpense(id)` helper hitting `GET /expenses/{id}`. It's read-only (category,
payment date, amount, paid to, paid by, and the category-specific details via the same
`expenseDetails` helper the list table uses) — editing only happens from the list table's
pencil icon, same "detail page is a pure view, list table icons are the mutation entry
points" split [[course]]/[[students]] use.

## Fields

- `category` — enum: `house_rent`, `asset`, `salary`, `electricity`, `internet`, `other`.
  Validated by a Pydantic enum (`ExpenseCategory` in `app/expenses/models.py`); stored as a
  plain string column, same non-native-enum choice as [[course]]'s
  `subject`/`class_level`/`batch_type`. Immutable after creation — see Rules below.
- `amount` — decimal (`Numeric(10, 2)`), must be >= 0
- `payment_date` — date, required — when the cost was actually paid. The one date field
  every category sets; used for sorting (`ExpenseRepository.list_all` orders by this,
  descending) and for the frontend's month filter (see above). Named `expense_date` before
  the rename described above.
- `paid_to` — free-text string — who or what the payment went to (e.g. a landlord's name, a
  vendor, a utility provider). Applies to every category, unlike `staff_name`/`description`
  below which are category-specific. Nullable at the DB (existing rows predate this column)
  but required by Pydantic on every create/update — same "DB permissive, Pydantic enforces"
  approach the category-specific fields below use.
- `paid_by` — enum (`PaymentMethod`: `cash`/`bank_transfer`/`dbbl_credit_card`/
  `ebl_credit_card`/`ucb_credit_card`) — how the payment was made. Applies to every category,
  same nullable-at-DB/required-by-Pydantic treatment as `paid_to`.
- `month` — nullable date (first-of-month, same shape as [[payment-tracking]]'s `month`) —
  required only for `house_rent` and `salary`; must be absent for the other four
  categories. Which calendar month the recurring cost/salary covers.
- `staff_name` — nullable free-text string — required only for `salary`. No dedicated Staff
  model exists in this system (single-teacher app, no other staff records anywhere) — this
  is deliberately just a text field, not a foreign key.
- `direction` — enum (`AssetDirection`: `purchase`/`sell`), nullable — required only for
  `asset`, must be absent otherwise. Distinguishes buying an asset (a cost) from selling one
  (money coming back) within the same category.
- `description` — nullable free-text string — required for `asset` (what the asset/item is),
  `electricity`/`internet` (e.g. which provider, or freeform notes), and `other` (freeform);
  optional/unused for `house_rent`/`salary`, which already have `month`/`staff_name` for
  identity.

Field presence per category is enforced by a Pydantic `model_validator(mode="after")` on a
shared `ExpenseFields` base class (`app/expenses/schemas.py`), inherited by both
`ExpenseCreate` and `ExpenseUpdate` so create and edit enforce identical rules — not by the
database, same choice [[course]] makes for `course_days`' `min_length=1` — since which
fields apply depends on `category`, not something a plain column constraint can express.

## Rules

- `id` is a UUID primary key, like every other table in this project.
- Add/edit/delete — `PUT /expenses/{id}` (`ExpenseService.update`, `ExpenseRepository.update`)
  lets every field except `category` be edited in place. `category` is immutable after
  creation: changing categories changes which fields are valid/required (see Fields above),
  so allowing it would mean re-validating and possibly discarding data from fields that no
  longer apply — delete and re-add instead if the category itself was wrong.
  `ExpenseUpdate` still carries `category` in its payload (identical shape to `ExpenseCreate`,
  both inheriting `ExpenseFields`) purely so `ExpenseService.update` can verify it wasn't
  changed and raise `ConflictException` (409) if it was — a safety net behind the frontend's
  disabled `<select>`, not the primary enforcement mechanism.
- **Not tied to [[students]], [[course]], or [[enrollment]] at all** — the one feature in
  this system that isn't part of the student/enrollment domain. No FK anywhere on `Expense`.
- `house_rent` is capped at one record per calendar month; `salary` is capped at one
  record per `(staff_name, month)` pair — enforced both in the service layer
  (`ExpenseService._check_conflict`, shared by `create` and `update`, pre-checks via
  `ExpenseRepository.get_house_rent_for_month`/`get_salary_for_staff_month` and raises
  `ConflictException`, 409, before ever reaching the DB, same "friendly 409 first" pattern
  [[payment-tracking]]/[[enrollment]] use — on `update` the check passes an `exclude_id` so
  an expense doesn't conflict with itself) and at the DB level via two **partial unique
  indexes** (`postgresql_where=`, the first use of this in the project's migrations — a
  plain composite `UniqueConstraint` can't express "unique only within one category" since
  the same `month`/`staff_name` columns are irrelevant to the other three categories):
  - `uq_expenses_house_rent_month` — unique `month` where `category = 'house_rent'`
    (renamed from `uq_expenses_contract_fare_month` in the same migration as the category
    rename)
  - `uq_expenses_salary_staff_month` — unique `(staff_name, month)` where `category = 'salary'`
- `asset`, `electricity`, `internet`, and `other` have no such cap — any number of records
  per month.
- No cascading deletes involved — `Expense` has no foreign keys to cascade from or to.
