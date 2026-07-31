import { create } from 'zustand'
import * as api from '../api'
import type { Expense, ExpenseInput } from '../types/expense'

interface ExpenseState {
  expenses: Expense[]
  isLoading: boolean
  fetchExpenses: () => Promise<void>
  createExpense: (input: ExpenseInput) => Promise<Expense>
  deleteExpense: (id: string) => Promise<void>
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  isLoading: false,

  async fetchExpenses() {
    set({ isLoading: true })
    try {
      const expenses = await api.getExpenses()
      set({ expenses, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  async createExpense(input) {
    const created = await api.createExpense(input)
    set({ expenses: [...get().expenses, created] })
    return created
  },

  async deleteExpense(id) {
    await api.deleteExpense(id)
    set({ expenses: get().expenses.filter((expense) => expense.id !== id) })
  },
}))
