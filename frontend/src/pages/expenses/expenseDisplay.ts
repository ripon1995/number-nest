import type { Expense, ExpenseCategory, PaymentMethod } from '../../types/expense'

const MONTH_FORMATTER = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' })

export const CATEGORY_OPTIONS: { value: ExpenseCategory; label: string }[] = [
  { value: 'house_rent', label: 'House rent' },
  { value: 'asset', label: 'Asset' },
  { value: 'salary', label: 'Salary' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'internet', label: 'Internet' },
  { value: 'other', label: 'Other' },
]

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  house_rent: 'House rent',
  asset: 'Asset',
  salary: 'Salary',
  electricity: 'Electricity',
  internet: 'Internet',
  other: 'Other',
}

export const PAID_BY_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'dbbl_credit_card', label: 'DBBL Credit card' },
  { value: 'ebl_credit_card', label: 'EBL Credit card' },
  { value: 'ucb_credit_card', label: 'UCB Credit card' },
]

const PAID_BY_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  bank_transfer: 'Bank transfer',
  dbbl_credit_card: 'DBBL Credit card',
  ebl_credit_card: 'EBL Credit card',
  ucb_credit_card: 'UCB Credit card',
}

export function formatCategory(category: ExpenseCategory): string {
  return CATEGORY_LABELS[category]
}

export function formatPaidBy(method: PaymentMethod): string {
  return PAID_BY_LABELS[method]
}

export function formatMonth(month: string): string {
  return MONTH_FORMATTER.format(new Date(`${month}T00:00:00`))
}

export function formatAmount(amount: string): string {
  return String(Math.round(Number(amount)))
}

export function monthInputToApi(value: string): string {
  return `${value}-01`
}

export function expenseDetails(expense: Expense): string {
  switch (expense.category) {
    case 'house_rent':
      return expense.month ? formatMonth(expense.month) : '—'
    case 'salary':
      return [expense.staff_name, expense.month ? formatMonth(expense.month) : null]
        .filter(Boolean)
        .join(' — ')
    case 'asset':
      return `${expense.direction === 'sell' ? 'Sold' : 'Purchased'}: ${expense.description ?? ''}`
    default:
      return expense.description ?? '—'
  }
}
