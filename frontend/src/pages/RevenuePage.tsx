import { useEffect, useState } from 'react'
import { usePaymentStore } from '../store/paymentStore'
import { useExpenseStore } from '../store/expenseStore'
import { ApiError } from '../errors/api'
import ErrorDialog from '../components/ErrorDialog'
import { RevenueIcon } from '../components/NavIcons'
import {
  filterExpensesByMonth,
  filterPaymentsByMonth,
  formatCurrency,
  sumAmounts,
} from './revenue/revenueDisplay'
import './revenue/revenue.css'

function toApiError(err: unknown): ApiError {
  return err instanceof ApiError ? err : new ApiError(0, 'Something went wrong', 'Something went wrong')
}

function RevenuePage() {
  const payments = usePaymentStore((state) => state.payments)
  const fetchPayments = usePaymentStore((state) => state.fetchPayments)
  const expenses = useExpenseStore((state) => state.expenses)
  const fetchExpenses = useExpenseStore((state) => state.fetchExpenses)

  const [error, setError] = useState<ApiError | null>(null)
  const [filterMonth, setFilterMonth] = useState('')

  useEffect(() => {
    fetchPayments().catch((err) => setError(toApiError(err)))
    fetchExpenses().catch((err) => setError(toApiError(err)))
  }, [fetchPayments, fetchExpenses])

  const filteredPayments = filterPaymentsByMonth(payments, filterMonth)
  const filteredExpenses = filterExpensesByMonth(expenses, filterMonth)

  const totalEarning = sumAmounts(filteredPayments)
  const totalExpense = sumAmounts(filteredExpenses)
  const netRevenue = totalEarning - totalExpense
  const netStatus = netRevenue >= 0 ? 'good' : 'critical'

  return (
    <main id="content" className="revenue-page">
      <div className="revenue-page-header">
        <h1 className="page-title">
          <span className="app-nav-icon">
            <RevenueIcon />
          </span>
          Revenue
        </h1>
      </div>

      <section className="revenue-filters">
        <label>
          Month
          <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} />
        </label>
        {filterMonth && (
          <button type="button" className="secondary" onClick={() => setFilterMonth('')}>
            Clear filter
          </button>
        )}
      </section>

      <section className="revenue-summary">
        <div className="revenue-tile">
          <span className="revenue-tile-label">Total earning</span>
          <span className="revenue-tile-value">{formatCurrency(totalEarning)}</span>
        </div>
        <div className="revenue-tile">
          <span className="revenue-tile-label">Total expense</span>
          <span className="revenue-tile-value">{formatCurrency(totalExpense)}</span>
        </div>
        <div className="revenue-tile">
          <span className="revenue-tile-label">Net revenue</span>
          <span className={`revenue-tile-value revenue-tile-value--${netStatus}`}>
            {formatCurrency(netRevenue)}
          </span>
          <span className={`revenue-tile-badge revenue-tile-badge--${netStatus}`}>
            {netRevenue >= 0 ? 'Profit' : 'Loss'}
          </span>
        </div>
      </section>

      <ErrorDialog error={error} onClose={() => setError(null)} />
    </main>
  )
}

export default RevenuePage
