import type { Payment } from '../../types/payment'
import type { Expense } from '../../types/expense'

export function sumAmounts(items: { amount: string }[]): number {
  return items.reduce((total, item) => total + Number(item.amount), 0)
}

export function filterPaymentsByMonth(payments: Payment[], month: string): Payment[] {
  if (!month) return payments
  return payments.filter((payment) => payment.month.slice(0, 7) === month)
}

export function filterExpensesByMonth(expenses: Expense[], month: string): Expense[] {
  if (!month) return expenses
  return expenses.filter((expense) => expense.expense_date.slice(0, 7) === month)
}

export function formatCurrency(value: number): string {
  return Math.round(value).toLocaleString('en-US')
}
