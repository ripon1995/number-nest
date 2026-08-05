import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as api from '../../api'
import { ApiError } from '../../errors/api'
import ErrorDialog from '../../components/ErrorDialog'
import Loader from '../../components/Loader'
import type { Expense } from '../../types/expense'
import { expenseDetails, formatAmount, formatCategory, formatPaidBy } from './expenseDisplay'
import './expenses.css'

function toApiError(err: unknown): ApiError {
  return err instanceof ApiError ? err : new ApiError(0, 'Something went wrong', 'Something went wrong')
}

function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [expense, setExpense] = useState<Expense | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    api
      .getExpense(id)
      .then(setExpense)
      .catch((err) => setError(toApiError(err)))
      .finally(() => setIsLoading(false))
  }, [id])

  return (
    <main id="content" className="expenses-page">
      <div className="expenses-page-header">
        <h1>Expense details</h1>
        <Link to="/expenses">Back to expenses</Link>
      </div>

      {isLoading && <Loader label="Loading expense…" />}

      {expense && (
        <section className="expense-detail-page">
          <div className="expense-detail card">
            <h2>{formatCategory(expense.category)}</h2>
            <dl className="expense-detail-list">
              <div>
                <dt>Details</dt>
                <dd>{expenseDetails(expense)}</dd>
              </div>
              <div>
                <dt>Payment date</dt>
                <dd>{expense.payment_date}</dd>
              </div>
              <div>
                <dt>Amount</dt>
                <dd>{formatAmount(expense.amount)}</dd>
              </div>
              <div>
                <dt>Paid to</dt>
                <dd>{expense.paid_to ?? '—'}</dd>
              </div>
              <div>
                <dt>Paid by</dt>
                <dd>{expense.paid_by ? formatPaidBy(expense.paid_by) : '—'}</dd>
              </div>
            </dl>
          </div>
        </section>
      )}

      <ErrorDialog error={error} onClose={() => setError(null)} />
    </main>
  )
}

export default ExpenseDetailPage
