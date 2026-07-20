import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as api from '../../api'
import { useEnrollmentStore } from '../../store/enrollmentStore'
import { useCourseStore } from '../../store/courseStore'
import { usePaymentStore } from '../../store/paymentStore'
import { ApiError } from '../../errors/api'
import ErrorDialog from '../../components/ErrorDialog'
import type { Student } from '../../types/student'
import { formatAmount, formatMonth } from '../payments/paymentDisplay'
import { buildDuePayments } from './studentDetailDisplay'
import './students.css'

function toApiError(err: unknown): ApiError {
  return err instanceof ApiError ? err : new ApiError(0, 'Something went wrong', 'Something went wrong')
}

function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [student, setStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  const enrollments = useEnrollmentStore((state) => state.enrollments)
  const fetchEnrollments = useEnrollmentStore((state) => state.fetchEnrollments)
  const courses = useCourseStore((state) => state.courses)
  const fetchCourses = useCourseStore((state) => state.fetchCourses)
  const payments = usePaymentStore((state) => state.payments)
  const fetchPayments = usePaymentStore((state) => state.fetchPayments)

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    api
      .getStudent(id)
      .then(setStudent)
      .catch((err) => setError(toApiError(err)))
      .finally(() => setIsLoading(false))
  }, [id])

  useEffect(() => {
    fetchEnrollments().catch((err) => setError(toApiError(err)))
    fetchCourses().catch((err) => setError(toApiError(err)))
    fetchPayments().catch((err) => setError(toApiError(err)))
  }, [fetchEnrollments, fetchCourses, fetchPayments])

  const coursesById = new Map(courses.map((course) => [course.id, course]))
  const studentEnrollments = id ? enrollments.filter((enrollment) => enrollment.student_id === id) : []
  const enrollmentsById = new Map(studentEnrollments.map((enrollment) => [enrollment.id, enrollment]))
  const studentPayments = payments
    .filter((payment) => enrollmentsById.has(payment.enrollment_id))
    .sort((a, b) => b.month.localeCompare(a.month) || b.payment_date.localeCompare(a.payment_date))

  const duePayments = buildDuePayments(studentEnrollments, coursesById, payments)

  return (
    <main id="content" className="students-page">
      <div className="students-page-header">
        <h1>Student details</h1>
        <Link to="/students">Back to students</Link>
      </div>

      {isLoading && <p>Loading student…</p>}

      {student && (
        <section className="student-detail-page">
          <div className="student-detail card">
            <h2>{student.name}</h2>
            <dl className="student-detail-list">
              <div>
                <dt>College</dt>
                <dd>{student.college ?? '—'}</dd>
              </div>
              <div>
                <dt>Contact</dt>
                <dd>{student.contact}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{student.email ?? '—'}</dd>
              </div>
              <div>
                <dt>WhatsApp</dt>
                <dd>{student.whatsapp_number}</dd>
              </div>
            </dl>

            <div className="student-enrollments">
              <h3>Enrollments</h3>
              {studentEnrollments.length === 0 ? (
                <p>Not enrolled in any course yet.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Enrollment date</th>
                      <th>Enrollment fee paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentEnrollments.map((enrollment) => (
                      <tr key={enrollment.id}>
                        <td>{coursesById.get(enrollment.course_id)?.course_name ?? 'Unknown course'}</td>
                        <td>{enrollment.start_from}</td>
                        <td>{enrollment.enrollment_fee_paid ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="student-due-payments card">
            <h2>Due payments</h2>
            {duePayments.length === 0 ? (
              <p>No due payments.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>SL</th>
                    <th>Course</th>
                    <th>Month</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {duePayments.map((due, index) => (
                    <tr key={`${due.enrollmentId}-${due.month}`}>
                      <td>{index + 1}</td>
                      <td>{due.courseName}</td>
                      <td>{formatMonth(due.month)}</td>
                      <td>{formatAmount(due.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="student-paid-payments card">
            <h2>Payment history</h2>
            {studentPayments.length === 0 ? (
              <p>No payments recorded yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>SL</th>
                    <th>Course</th>
                    <th>Month</th>
                    <th>Payment date</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {studentPayments.map((payment, index) => (
                    <tr key={payment.id}>
                      <td>{index + 1}</td>
                      <td>
                        {coursesById.get(enrollmentsById.get(payment.enrollment_id)?.course_id ?? '')
                          ?.course_name ?? 'Unknown course'}
                      </td>
                      <td>{formatMonth(payment.month)}</td>
                      <td>{payment.payment_date}</td>
                      <td>{formatAmount(payment.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      )}

      <ErrorDialog error={error} onClose={() => setError(null)} />
    </main>
  )
}

export default StudentDetailPage
