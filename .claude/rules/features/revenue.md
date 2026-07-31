# Revenue

A read-only summary of institutional earning vs. cost — the last link in `NavMenu`, route
`/revenue`. Unlike every other feature, **there is no `app/revenue/` backend module and no
new persisted data at all**: `RevenuePage` (`frontend/src/pages/RevenuePage.tsx` +
`frontend/src/pages/revenue/`) is built entirely from data [[payment-tracking]] and
[[expense-tracking]] already fetch into their own Zustand stores (`paymentStore`/
`expenseStore`), the same "compute client-side over already-fetched data, no dedicated
endpoint" technique `DashboardPage` uses for its attendance/marks charts and
`StudentDetailPage`'s `buildDuePayments` uses for due payments.

## What it shows

Three KPI stat tiles (`frontend/src/pages/revenue/revenueDisplay.ts` provides the pure
functions, `revenue.css` the layout):

- **Total earning** — `sumAmounts` over the (optionally month-filtered) `payments` list, i.e.
  every recorded [[payment-tracking]] `Payment.amount`.
- **Total expense** — `sumAmounts` over the (optionally month-filtered) `expenses` list, i.e.
  every recorded [[expense-tracking]] `Expense.amount`.
- **Net revenue** — `Total earning - Total expense`, computed in `RevenuePage` itself (not a
  `revenueDisplay.ts` export, since it's a one-line subtraction of the two tiles above). The
  value is colored via the existing `--status-good`/`--status-critical` CSS tokens (already
  used by `AttendanceDonut` on the Dashboard) depending on its sign, paired with a "Profit"/
  "Loss" text badge — matching the project's rule that a status color always ships with an
  icon/label, never color alone.

Values render through `formatCurrency` (comma-grouped, e.g. `12,340`), not the plain
`formatAmount` every list table uses — a deliberate difference, since these are large
standalone hero-style numbers rather than table cells.

## Month filter

A single `<input type="month">` (default empty = all-time) narrows both totals at once:

- `filterPaymentsByMonth` matches against `Payment.month`'s `YYYY-MM` prefix (every payment
  always has one).
- `filterExpensesByMonth` matches against `Expense.expense_date`'s `YYYY-MM` prefix — **not**
  `Expense.month`, which only the `contract_fare`/`salary` categories ever set; filtering on
  that field would silently drop every `asset`/`utility`/`other` expense from the total. This
  is the same choice [[expense-tracking]]'s own `ExpensesPage` filter makes.

A "Clear filter" button appears once a month is selected, resetting to the all-time view —
same pattern as every other feature's filter bar, just with one field instead of several.

## Rules

- No model, schema, repository, service, or router — this feature is 100% frontend, reusing
  `paymentStore`/`expenseStore`'s existing `fetchPayments`/`fetchExpenses` actions.
- Read-only — no create/edit/delete action anywhere on this page.
- Placed last in `NavMenu`'s link list (`RevenueIcon`, a trending-up glyph, distinct from
  [[payment-tracking]]'s card icon and [[expense-tracking]]'s receipt icon).
