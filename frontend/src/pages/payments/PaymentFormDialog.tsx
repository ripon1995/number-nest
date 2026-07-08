import { useState, type FormEvent } from 'react'
import Modal from '../../components/Modal'
import { usePaymentStore } from '../../store/paymentStore'
import { ApiError } from '../../errors/api'
import type { PaymentInput } from '../../types/payment'
import type { Enrollment } from '../../types/enrollment'
import type { Student } from '../../types/student'
import type { Course } from '../../types/course'
import { monthInputToApi } from './paymentDisplay'
import './payments.css'

interface PaymentFormDialogProps {
  enrollments: Enrollment[]
  studentsById: Map<string, Student>
  coursesById: Map<string, Course>
  onClose: () => void
  onError: (err: ApiError) => void
}

interface FormState {
  enrollment_id: string
  month: string
  payment_date: string
  amount: string
}

function enrollmentLabel(
  enrollment: Enrollment,
  studentsById: Map<string, Student>,
  coursesById: Map<string, Course>,
): string {
  const studentName = studentsById.get(enrollment.student_id)?.name ?? 'Unknown student'
  const courseName = coursesById.get(enrollment.course_id)?.course_name ?? 'Unknown course'
  return `${studentName} — ${courseName}`
}

function PaymentFormDialog({
  enrollments,
  studentsById,
  coursesById,
  onClose,
  onError,
}: PaymentFormDialogProps) {
  const createPayment = usePaymentStore((state) => state.createPayment)

  const [form, setForm] = useState<FormState>({
    enrollment_id: enrollments[0]?.id ?? '',
    month: '',
    payment_date: '',
    amount: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const payload: PaymentInput = {
      enrollment_id: form.enrollment_id,
      month: monthInputToApi(form.month),
      payment_date: form.payment_date,
      amount: form.amount,
    }

    setIsSubmitting(true)
    try {
      await createPayment(payload)
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
    <Modal labelledBy="payment-dialog-title" onClose={onClose}>
      <form className="payment-form" onSubmit={handleSubmit}>
        <h2 id="payment-dialog-title">Record payment</h2>
        <label>
          Enrollment
          <select
            value={form.enrollment_id}
            onChange={(e) => setForm({ ...form, enrollment_id: e.target.value })}
            required
          >
            {enrollments.map((enrollment) => (
              <option key={enrollment.id} value={enrollment.id}>
                {enrollmentLabel(enrollment, studentsById, coursesById)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Month
          <input
            type="month"
            value={form.month}
            onChange={(e) => setForm({ ...form, month: e.target.value })}
            required
          />
        </label>
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
        <div className="payment-form-actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Record payment'}
          </button>
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default PaymentFormDialog
