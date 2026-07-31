import type { Expense, ExpenseCategory } from '../../types/expense'

const MONTH_FORMATTER = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' })

export const CATEGORY_OPTIONS: { value: ExpenseCategory; label: string }[] = [
  { value: 'contract_fare', label: 'Contract fare' },
  { value: 'asset', label: 'Asset' },
  { value: 'salary', label: 'Salary' },
  { value: 'utility', label: 'Utility' },
  { value: 'other', label: 'Other' },
]

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  contract_fare: 'Contract fare',
  asset: 'Asset',
  salary: 'Salary',
  utility: 'Utility',
  other: 'Other',
}

export function formatCategory(category: ExpenseCategory): string {
  return CATEGORY_LABELS[category]
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
    case 'contract_fare':
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
