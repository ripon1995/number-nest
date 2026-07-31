import { useEffect, useState } from 'react'
import { useExpenseStore } from '../store/expenseStore'
import { ApiError } from '../errors/api'
import ErrorDialog from '../components/ErrorDialog'
import { PlusIcon } from '../components/Icons'
import { ExpensesIcon } from '../components/NavIcons'
import ExpenseTable from './expenses/ExpenseTable'
import ExpenseFormDialog from './expenses/ExpenseFormDialog'
import { CATEGORY_OPTIONS } from './expenses/expenseDisplay'
import type { Expense, ExpenseCategory } from '../types/expense'
import './expenses/expenses.css'

function toApiError(err: unknown): ApiError {
  return err instanceof ApiError ? err : new ApiError(0, 'Something went wrong', 'Something went wrong')
}

function ExpensesPage() {
  const expenses = useExpenseStore((state) => state.expenses)
  const isLoading = useExpenseStore((state) => state.isLoading)
  const fetchExpenses = useExpenseStore((state) => state.fetchExpenses)
  const deleteExpense = useExpenseStore((state) => state.deleteExpense)

  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | ''>('')
  const [filterMonth, setFilterMonth] = useState('')

  useEffect(() => {
    fetchExpenses().catch((err) => setError(toApiError(err)))
  }, [fetchExpenses])

  const filteredExpenses = expenses.filter((expense) => {
    if (filterCategory && expense.category !== filterCategory) return false
    if (filterMonth && expense.expense_date.slice(0, 7) !== filterMonth) return false
    return true
  })

  const hasActiveFilters = Boolean(filterCategory || filterMonth)

  function handleClearFilters() {
    setFilterCategory('')
    setFilterMonth('')
  }

  async function handleDelete(expense: Expense) {
    if (!window.confirm('Delete this expense record?')) return
    setDeletingId(expense.id)
    setError(null)
    try {
      await deleteExpense(expense.id)
    } catch (err) {
      setError(toApiError(err))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main id="content" className="expenses-page">
      <div className="expenses-page-header">
        <h1 className="page-title">
          <span className="app-nav-icon">
            <ExpensesIcon />
          </span>
          Expenses
        </h1>
        <button type="button" onClick={() => setIsCreating(true)}>
          <PlusIcon /> Add expense
        </button>
      </div>

      <section className="expense-filters">
        <label>
          Category
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as ExpenseCategory | '')}
          >
            <option value="">All categories</option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Month
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          />
        </label>
        {hasActiveFilters && (
          <button type="button" className="secondary" onClick={handleClearFilters}>
            Clear filters
          </button>
        )}
      </section>

      <section className="expense-list">
        <ExpenseTable
          expenses={filteredExpenses}
          isLoading={isLoading}
          deletingId={deletingId}
          onDelete={handleDelete}
          emptyMessage={hasActiveFilters ? 'No expenses match the selected filters.' : undefined}
        />
      </section>

      {isCreating && <ExpenseFormDialog onClose={() => setIsCreating(false)} onError={setError} />}

      <ErrorDialog error={error} onClose={() => setError(null)} />
    </main>
  )
}

export default ExpensesPage
