import { useEffect, useState } from 'react'
import { usePaymentStore } from '../store/paymentStore'
import { useEnrollmentStore } from '../store/enrollmentStore'
import { useStudentStore } from '../store/studentStore'
import { useCourseStore } from '../store/courseStore'
import { ApiError } from '../errors/api'
import ErrorDialog from '../components/ErrorDialog'
import ConfirmDialog from '../components/ConfirmDialog'
import { PlusIcon } from '../components/Icons'
import { PaymentsIcon } from '../components/NavIcons'
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
  const [pendingDelete, setPendingDelete] = useState<Payment | null>(null)

  const [filterCourseId, setFilterCourseId] = useState('')
  const [filterStudentId, setFilterStudentId] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterDay, setFilterDay] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchPayments().catch((err) => setError(toApiError(err)))
    fetchEnrollments().catch((err) => setError(toApiError(err)))
    fetchStudents().catch((err) => setError(toApiError(err)))
    fetchCourses().catch((err) => setError(toApiError(err)))
  }, [fetchPayments, fetchEnrollments, fetchStudents, fetchCourses])

  const enrollmentsById = new Map(enrollments.map((enrollment) => [enrollment.id, enrollment]))
  const studentsById = new Map(students.map((student) => [student.id, student]))
  const coursesById = new Map(courses.map((course) => [course.id, course]))

  const trimmedSearch = searchQuery.trim().toLowerCase()

  const filteredPayments = payments.filter((payment) => {
    const enrollment = enrollmentsById.get(payment.enrollment_id)
    if (filterCourseId && enrollment?.course_id !== filterCourseId) return false
    if (filterStudentId && enrollment?.student_id !== filterStudentId) return false
    if (filterMonth && payment.month.slice(0, 7) !== filterMonth) return false
    if (filterDay && payment.payment_date !== filterDay) return false
    if (trimmedSearch) {
      const studentName = enrollment ? (studentsById.get(enrollment.student_id)?.name ?? '') : ''
      if (!studentName.toLowerCase().includes(trimmedSearch)) return false
    }
    return true
  })

  const hasActiveFilters = Boolean(filterCourseId || filterStudentId || filterMonth || filterDay || trimmedSearch)

  function handleClearFilters() {
    setFilterCourseId('')
    setFilterStudentId('')
    setFilterMonth('')
    setFilterDay('')
    setSearchQuery('')
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeletingId(pendingDelete.id)
    setError(null)
    try {
      await deletePayment(pendingDelete.id)
    } catch (err) {
      setError(toApiError(err))
    } finally {
      setDeletingId(null)
      setPendingDelete(null)
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
        <h1 className="page-title">
          <span className="app-nav-icon">
            <PaymentsIcon />
          </span>
          Payments
        </h1>
        <button type="button" onClick={handleAddClick}>
          <PlusIcon /> Add payment
        </button>
      </div>

      <section className="payment-filters">
        <label>
          Search
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Student name…"
          />
        </label>
        <label>
          Course
          <select value={filterCourseId} onChange={(e) => setFilterCourseId(e.target.value)}>
            <option value="">All courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.course_name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Student
          <select value={filterStudentId} onChange={(e) => setFilterStudentId(e.target.value)}>
            <option value="">All students</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
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
        <label>
          Payment date
          <input type="date" value={filterDay} onChange={(e) => setFilterDay(e.target.value)} />
        </label>
        {hasActiveFilters && (
          <button type="button" className="secondary" onClick={handleClearFilters}>
            Clear filters
          </button>
        )}
      </section>

      <section className="payment-list">
        <PaymentTable
          payments={filteredPayments}
          enrollmentsById={enrollmentsById}
          studentsById={studentsById}
          coursesById={coursesById}
          isLoading={isLoading}
          deletingId={deletingId}
          onDelete={setPendingDelete}
          emptyMessage={
            hasActiveFilters ? 'No payments match the selected filters.' : undefined
          }
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

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this payment record?"
        isConfirming={deletingId !== null}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <ErrorDialog error={error} onClose={() => setError(null)} />
    </main>
  )
}

export default PaymentsPage
