import type { Expense } from '../../types/expense'
import { EyeIcon, PencilIcon, TrashIcon } from './ExpenseIcons'
import { formatCategory, formatAmount, expenseDetails } from './expenseDisplay'
import Loader from '../../components/Loader'
import './expenses.css'

interface ExpenseTableProps {
  expenses: Expense[]
  isLoading: boolean
  deletingId: string | null
  onViewDetail: (expense: Expense) => void
  onEdit: (expense: Expense) => void
  onDelete: (expense: Expense) => void
  emptyMessage?: string
}

function ExpenseTable({
  expenses,
  isLoading,
  deletingId,
  onViewDetail,
  onEdit,
  onDelete,
  emptyMessage = 'No expenses recorded yet.',
}: ExpenseTableProps) {
  if (isLoading) return <Loader label="Loading expenses…" />
  if (expenses.length === 0) return <p>{emptyMessage}</p>

  return (
    <table>
      <thead>
        <tr>
          <th>SL</th>
          <th>Category</th>
          <th>Details</th>
          <th>Payment date</th>
          <th>Amount</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {expenses.map((expense, index) => (
          <tr key={expense.id}>
            <td>{index + 1}</td>
            <td>{formatCategory(expense.category)}</td>
            <td>{expenseDetails(expense)}</td>
            <td>{expense.payment_date}</td>
            <td>{formatAmount(expense.amount)}</td>
            <td className="expense-row-actions">
              <button
                type="button"
                aria-label="View expense details"
                title="Details"
                onClick={() => onViewDetail(expense)}
              >
                <EyeIcon />
              </button>
              <button type="button" aria-label="Edit expense" title="Edit" onClick={() => onEdit(expense)}>
                <PencilIcon />
              </button>
              <button
                type="button"
                className="secondary"
                aria-label="Delete expense"
                title="Delete"
                onClick={() => onDelete(expense)}
                disabled={deletingId === expense.id}
              >
                <TrashIcon />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default ExpenseTable
