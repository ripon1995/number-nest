import { useState, type FormEvent } from 'react'
import Modal from '../../components/Modal'
import { useExpenseStore } from '../../store/expenseStore'
import { ApiError } from '../../errors/api'
import type { AssetDirection, ExpenseCategory, ExpenseInput } from '../../types/expense'
import { CATEGORY_OPTIONS, monthInputToApi } from './expenseDisplay'
import './expenses.css'

interface ExpenseFormDialogProps {
  onClose: () => void
  onError: (err: ApiError) => void
}

interface FormState {
  category: ExpenseCategory
  amount: string
  expense_date: string
  month: string
  staff_name: string
  direction: AssetDirection
  description: string
}

function ExpenseFormDialog({ onClose, onError }: ExpenseFormDialogProps) {
  const createExpense = useExpenseStore((state) => state.createExpense)

  const [form, setForm] = useState<FormState>({
    category: 'contract_fare',
    amount: '',
    expense_date: '',
    month: '',
    staff_name: '',
    direction: 'purchase',
    description: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const needsMonth = form.category === 'contract_fare' || form.category === 'salary'
  const needsStaffName = form.category === 'salary'
  const needsDirection = form.category === 'asset'
  const needsDescription =
    form.category === 'asset' || form.category === 'utility' || form.category === 'other'
  const descriptionLabel = form.category === 'asset' ? 'Asset / item' : 'Description'

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const payload: ExpenseInput = {
      category: form.category,
      amount: form.amount,
      expense_date: form.expense_date,
      month: needsMonth ? monthInputToApi(form.month) : null,
      staff_name: needsStaffName ? form.staff_name : null,
      direction: needsDirection ? form.direction : null,
      description: needsDescription ? form.description : null,
    }

    setIsSubmitting(true)
    try {
      await createExpense(payload)
      onClose()
    } catch (err) {
      onError(
        err instanceof ApiError
          ? err
          : new ApiError(0, 'Something went wrong', 'Something went wrong'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal labelledBy="expense-dialog-title" onClose={onClose} className="expense-modal">
      <form className="expense-form" onSubmit={handleSubmit}>
        <h2 id="expense-dialog-title">Record expense</h2>
        <label>
          Category
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}
            required
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {needsMonth && (
          <label>
            Month
            <input
              type="month"
              value={form.month}
              onChange={(e) => setForm({ ...form, month: e.target.value })}
              required
            />
          </label>
        )}
        {needsStaffName && (
          <label>
            Staff name
            <input
              type="text"
              value={form.staff_name}
              onChange={(e) => setForm({ ...form, staff_name: e.target.value })}
              required
            />
          </label>
        )}
        {needsDirection && (
          <label>
            Purchase or sell
            <select
              value={form.direction}
              onChange={(e) => setForm({ ...form, direction: e.target.value as AssetDirection })}
              required
            >
              <option value="purchase">Purchase</option>
              <option value="sell">Sell</option>
            </select>
          </label>
        )}
        {needsDescription && (
          <label>
            {descriptionLabel}
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </label>
        )}
        <label>
          Expense date
          <input
            type="date"
            value={form.expense_date}
            onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
            required
          />
        </label>
        <label>
          Amount
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
        </label>
        <div className="expense-form-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Record expense'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ExpenseFormDialog
