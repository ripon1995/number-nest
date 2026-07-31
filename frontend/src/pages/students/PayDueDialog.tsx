import { useState, type FormEvent } from 'react'
import Modal from '../../components/Modal'
import { usePaymentStore } from '../../store/paymentStore'
import { ApiError } from '../../errors/api'
import type { PaymentInput } from '../../types/payment'
import { formatMonth } from '../payments/paymentDisplay'
import type { DuePaymentEntry } from './studentDetailDisplay'

interface PayDueDialogProps {
  due: DuePaymentEntry
  onClose: () => void
  onPaid: () => void
  onError: (err: ApiError) => void
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function PayDueDialog({ due, onClose, onPaid, onError }: PayDueDialogProps) {
  const createPayment = usePaymentStore((state) => state.createPayment)

  const [amount, setAmount] = useState(due.amount)
  const [paymentDate, setPaymentDate] = useState(todayDate())
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const payload: PaymentInput = {
      enrollment_id: due.enrollmentId,
      month: due.month,
      payment_date: paymentDate,
      amount,
    }

    setIsSubmitting(true)
    try {
      await createPayment(payload)
      onPaid()
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
      labelledBy="pay-due-dialog-title"
      onClose={onClose}
      className="payment-modal"
      isSubmitting={isSubmitting}
    >
      <form className="payment-form" onSubmit={handleSubmit}>
        <h2 id="pay-due-dialog-title">Record payment</h2>
        <dl className="student-detail-list">
          <div>
            <dt>Course</dt>
            <dd>{due.courseName}</dd>
          </div>
          <div>
            <dt>Month</dt>
            <dd>{formatMonth(due.month)}</dd>
          </div>
        </dl>
        <label>
          Amount
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            autoFocus
          />
        </label>
        <label>
          Payment date
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            required
          />
        </label>
        <div className="payment-form-actions">
          <button type="button" className="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting}>
            Save payment
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default PayDueDialog