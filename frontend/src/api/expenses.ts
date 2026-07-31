import { request, authHeaders } from './client'
import type { Expense, ExpenseInput } from '../types/expense'

export function getExpenses(): Promise<Expense[]> {
  return request<Expense[]>('/expenses', { headers: authHeaders() })
}

export function createExpense(input: ExpenseInput): Promise<Expense> {
  return request<Expense>('/expenses', {
    method: 'POST',
    body: JSON.stringify(input),
    headers: authHeaders(),
  })
}

export function deleteExpense(id: string): Promise<void> {
  return request<void>(`/expenses/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
}
