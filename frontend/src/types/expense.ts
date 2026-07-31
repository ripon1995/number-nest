export type ExpenseCategory = 'contract_fare' | 'asset' | 'salary' | 'utility' | 'other'
export type AssetDirection = 'purchase' | 'sell'

export interface Expense {
  id: string
  category: ExpenseCategory
  amount: string
  expense_date: string
  month: string | null
  staff_name: string | null
  direction: AssetDirection | null
  description: string | null
  created_at: string
}

export interface ExpenseInput {
  category: ExpenseCategory
  amount: string
  expense_date: string
  month?: string | null
  staff_name?: string | null
  direction?: AssetDirection | null
  description?: string | null
}
