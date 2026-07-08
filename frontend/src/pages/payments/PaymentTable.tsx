import type { Payment } from '../../types/payment'
import type { Enrollment } from '../../types/enrollment'
import type { Student } from '../../types/student'
import type { Course } from '../../types/course'
import { TrashIcon } from './PaymentIcons'
import { formatMonth, formatAmount } from './paymentDisplay'
import './payments.css'

interface PaymentTableProps {
  payments: Payment[]
  enrollmentsById: Map<string, Enrollment>
  studentsById: Map<string, Student>
  coursesById: Map<string, Course>
  isLoading: boolean
  deletingId: string | null
  onDelete: (payment: Payment) => void
}

function PaymentTable({
  payments,
  enrollmentsById,
  studentsById,
  coursesById,
  isLoading,
  deletingId,
  onDelete,
}: PaymentTableProps) {
  if (isLoading) return <p>Loading payments…</p>
  if (payments.length === 0) return <p>No payments recorded yet.</p>

  function studentName(payment: Payment): string {
    const enrollment = enrollmentsById.get(payment.enrollment_id)
    if (!enrollment) return 'Unknown student'
    return studentsById.get(enrollment.student_id)?.name ?? 'Unknown student'
  }

  function courseName(payment: Payment): string {
    const enrollment = enrollmentsById.get(payment.enrollment_id)
    if (!enrollment) return 'Unknown course'
    return coursesById.get(enrollment.course_id)?.course_name ?? 'Unknown course'
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Student</th>
          <th>Course</th>
          <th>Month</th>
          <th>Payment date</th>
          <th>Amount</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {payments.map((payment) => (
          <tr key={payment.id}>
            <td>{studentName(payment)}</td>
            <td>{courseName(payment)}</td>
            <td>{formatMonth(payment.month)}</td>
            <td>{payment.payment_date}</td>
            <td>{formatAmount(payment.amount)}</td>
            <td className="payment-row-actions">
              <button
                type="button"
                className="secondary"
                aria-label="Delete payment"
                title="Delete"
                onClick={() => onDelete(payment)}
                disabled={deletingId === payment.id}
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

export default PaymentTable
