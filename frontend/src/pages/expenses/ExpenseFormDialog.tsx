import { useState, type FormEvent } from 'react'
import Modal from '../../components/Modal'
import { useExpenseStore } from '../../store/expenseStore'
import { ApiError } from '../../errors/api'
import type { AssetDirection, Expense, ExpenseCategory, ExpenseInput, PaymentMethod } from '../../types/expense'
import { CATEGORY_OPTIONS, PAID_BY_OPTIONS, monthInputToApi } from './expenseDisplay'
import './expenses.css'

interface ExpenseFormDialogProps {
  expense?: Expense | null
  onClose: () => void
  onError: (err: ApiError) => void
}

interface FormState {
  category: ExpenseCategory
  amount: string
  payment_date: string
  paid_to: string
  paid_by: PaymentMethod
  month: string
  staff_name: string
  direction: AssetDirection
  description: string
}

function initialFormState(expense: Expense | null | undefined): FormState {
  if (!expense) {
    return {
      category: 'house_rent',
      amount: '',
      payment_date: '',
      paid_to: '',
      paid_by: 'cash',
      month: '',
      staff_name: '',
      direction: 'purchase',
      description: '',
    }
  }
  return {
    category: expense.category,
    amount: expense.amount,
    payment_date: expense.payment_date,
    paid_to: expense.paid_to ?? '',
    paid_by: expense.paid_by ?? 'cash',
    month: expense.month ? expense.month.slice(0, 7) : '',
    staff_name: expense.staff_name ?? '',
    direction: expense.direction ?? 'purchase',
    description: expense.description ?? '',
  }
}

function ExpenseFormDialog({ expense, onClose, onError }: ExpenseFormDialogProps) {
  const createExpense = useExpenseStore((state) => state.createExpense)
  const updateExpense = useExpenseStore((state) => state.updateExpense)
  const isEditing = expense != null

  const [form, setForm] = useState<FormState>(() => initialFormState(expense))
  const [isSubmitting, setIsSubmitting] = useState(false)

  const needsMonth = form.category === 'house_rent' || form.category === 'salary'
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
      payment_date: form.payment_date,
      paid_to: form.paid_to,
      paid_by: form.paid_by,
      month: needsMonth ? monthInputToApi(form.month) : null,
      staff_name: needsStaffName ? form.staff_name : null,
      direction: needsDirection ? form.direction : null,
      description: needsDescription ? form.description : null,
    }

    setIsSubmitting(true)
    try {
      if (isEditing) {
        await updateExpense(expense.id, payload)
      } else {
        await createExpense(payload)
      }
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
    <Modal
      labelledBy="expense-dialog-title"
      onClose={onClose}
      className="expense-modal"
      isSubmitting={isSubmitting}
    >
      <form className="expense-form" onSubmit={handleSubmit}>
        <h2 id="expense-dialog-title">{isEditing ? 'Edit expense' : 'Record expense'}</h2>
        <label>
          Category
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}
            disabled={isEditing}
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
          Payment date
          <input
            type="date"
            value={form.payment_date}
            onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
            required
          />
        </label>
        <label>
          Paid to
          <input
            type="text"
            value={form.paid_to}
            onChange={(e) => setForm({ ...form, paid_to: e.target.value })}
            required
          />
        </label>
        <label>
          Paid by
          <select
            value={form.paid_by}
            onChange={(e) => setForm({ ...form, paid_by: e.target.value as PaymentMethod })}
            required
          >
            {PAID_BY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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
          <button type="button" className="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting}>
            {isEditing ? 'Save changes' : 'Record expense'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ExpenseFormDialog
