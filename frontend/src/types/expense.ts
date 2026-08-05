export type ExpenseCategory = 'house_rent' | 'asset' | 'salary' | 'utility' | 'other'
export type AssetDirection = 'purchase' | 'sell'
export type PaymentMethod = 'cash' | 'bank_transfer'

export interface Expense {
  id: string
  category: ExpenseCategory
  amount: string
  payment_date: string
  paid_to: string | null
  paid_by: PaymentMethod | null
  month: string | null
  staff_name: string | null
  direction: AssetDirection | null
  description: string | null
  created_at: string
}

export interface ExpenseInput {
  category: ExpenseCategory
  amount: string
  payment_date: string
  paid_to: string
  paid_by: PaymentMethod
  month?: string | null
  staff_name?: string | null
  direction?: AssetDirection | null
  description?: string | null
}
