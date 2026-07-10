import { useEffect, useState } from 'react'
import { usePaymentStore } from '../store/paymentStore'
import { useEnrollmentStore } from '../store/enrollmentStore'
import { useStudentStore } from '../store/studentStore'
import { useCourseStore } from '../store/courseStore'
import { ApiError } from '../errors/api'
import ErrorDialog from '../components/ErrorDialog'
import PaymentTable from './payments/PaymentTable'
import PaymentFormDialog from './payments/PaymentFormDialog'
import type { Payment } from '../types/payment'
import './payments/payments.css'

function toApiError(err: unknown): ApiError {
  return err instanceof ApiError ? err : new ApiError(0, 'Something went wrong', 'Something went wrong')
}

function PaymentsPage() {
  const payments = usePaymentStore((state) => state.payments)
  const isLoading = usePaymentStore((state) => state.isLoading)
  const fetchPayments = usePaymentStore((state) => state.fetchPayments)
  const deletePayment = usePaymentStore((state) => state.deletePayment)

  const enrollments = useEnrollmentStore((state) => state.enrollments)
  const fetchEnrollments = useEnrollmentStore((state) => state.fetchEnrollments)
  const students = useStudentStore((state) => state.students)
  const fetchStudents = useStudentStore((state) => state.fetchStudents)
  const courses = useCourseStore((state) => state.courses)
  const fetchCourses = useCourseStore((state) => state.fetchCourses)

  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchPayments().catch((err) => setError(toApiError(err)))
    fetchEnrollments().catch((err) => setError(toApiError(err)))
    fetchStudents().catch((err) => setError(toApiError(err)))
    fetchCourses().catch((err) => setError(toApiError(err)))
  }, [fetchPayments, fetchEnrollments, fetchStudents, fetchCourses])

  const enrollmentsById = new Map(enrollments.map((enrollment) => [enrollment.id, enrollment]))
  const studentsById = new Map(students.map((student) => [student.id, student]))
  const coursesById = new Map(courses.map((course) => [course.id, course]))

  async function handleDelete(payment: Payment) {
    if (!window.confirm('Delete this payment record?')) return
    setDeletingId(payment.id)
    setError(null)
    try {
      await deletePayment(payment.id)
    } catch (err) {
      setError(toApiError(err))
    } finally {
      setDeletingId(null)
    }
  }

  function handleAddClick() {
    if (enrollments.length === 0) {
      setError(
        new ApiError(
          0,
          'Nothing to record',
          'Add at least one enrollment before recording a payment.',
        ),
      )
      return
    }
    setIsCreating(true)
  }

  return (
    <main id="content" className="payments-page">
      <div className="payments-page-header">
        <h1>Payments</h1>
        <button type="button" onClick={handleAddClick}>
          Add payment
        </button>
      </div>

      <section className="payment-list">
        <PaymentTable
          payments={payments}
          enrollmentsById={enrollmentsById}
          studentsById={studentsById}
          coursesById={coursesById}
          isLoading={isLoading}
          deletingId={deletingId}
          onDelete={handleDelete}
        />
      </section>

      {isCreating && (
        <PaymentFormDialog
          enrollments={enrollments}
          courses={courses}
          studentsById={studentsById}
          onClose={() => setIsCreating(false)}
          onError={setError}
        />
      )}

      <ErrorDialog error={error} onClose={() => setError(null)} />
    </main>
  )
}

export default PaymentsPage
