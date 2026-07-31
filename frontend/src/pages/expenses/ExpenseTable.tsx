import type { Expense } from '../../types/expense'
import { TrashIcon } from './ExpenseIcons'
import { formatCategory, formatAmount, expenseDetails } from './expenseDisplay'
import Loader from '../../components/Loader'
import './expenses.css'

interface ExpenseTableProps {
  expenses: Expense[]
  isLoading: boolean
  deletingId: string | null
  onDelete: (expense: Expense) => void
  emptyMessage?: string
}

function ExpenseTable({
  expenses,
  isLoading,
  deletingId,
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
          <th>Date</th>
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
            <td>{expense.expense_date}</td>
            <td>{formatAmount(expense.amount)}</td>
            <td className="expense-row-actions">
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
