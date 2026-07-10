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
  courses: Course[]
  studentsById: Map<string, Student>
  onClose: () => void
  onError: (err: ApiError) => void
}

interface FormState {
  course_id: string
  enrollment_id: string
  month: string
  payment_date: string
  amount: string
}

function studentLabel(enrollment: Enrollment, studentsById: Map<string, Student>): string {
  return studentsById.get(enrollment.student_id)?.name ?? 'Unknown student'
}

function PaymentFormDialog({
  enrollments,
  courses,
  studentsById,
  onClose,
  onError,
}: PaymentFormDialogProps) {
  const createPayment = usePaymentStore((state) => state.createPayment)

  const enrolledCourseIds = new Set(enrollments.map((enrollment) => enrollment.course_id))
  const availableCourses = courses.filter((course) => enrolledCourseIds.has(course.id))

  const initialCourseId = availableCourses[0]?.id ?? ''
  const initialEnrollments = enrollments.filter(
    (enrollment) => enrollment.course_id === initialCourseId,
  )

  const [form, setForm] = useState<FormState>({
    course_id: initialCourseId,
    enrollment_id: initialEnrollments[0]?.id ?? '',
    month: '',
    payment_date: '',
    amount: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const enrollmentsForCourse = enrollments.filter(
    (enrollment) => enrollment.course_id === form.course_id,
  )

  function handleCourseChange(courseId: string) {
    const firstEnrollment = enrollments.find((enrollment) => enrollment.course_id === courseId)
    setForm({ ...form, course_id: courseId, enrollment_id: firstEnrollment?.id ?? '' })
  }

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
    <Modal labelledBy="payment-dialog-title" onClose={onClose} className="payment-modal">
      <form className="payment-form" onSubmit={handleSubmit}>
        <h2 id="payment-dialog-title">Record payment</h2>
        <label>
          Course
          <select
            value={form.course_id}
            onChange={(e) => handleCourseChange(e.target.value)}
            required
          >
            {availableCourses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.course_name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Enrollment
          <select
            value={form.enrollment_id}
            onChange={(e) => setForm({ ...form, enrollment_id: e.target.value })}
            required
          >
            {enrollmentsForCourse.map((enrollment) => (
              <option key={enrollment.id} value={enrollment.id}>
                {studentLabel(enrollment, studentsById)}
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
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Record payment'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default PaymentFormDialog
