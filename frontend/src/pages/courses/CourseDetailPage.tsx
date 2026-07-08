import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as api from '../../lib/api'
import { ApiError } from '../../errors/api'
import ErrorDialog from '../../components/ErrorDialog'
import type { CourseDetail } from '../../types/course'
import { SUBJECT_LABELS, formatDays, formatFee } from './courseDisplay'
import './courses.css'

function toApiError(err: unknown): ApiError {
  return err instanceof ApiError ? err : new ApiError(0, 'Something went wrong', 'Something went wrong')
}

function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    api
      .getCourse(id)
      .then(setCourse)
      .catch((err) => setError(toApiError(err)))
      .finally(() => setIsLoading(false))
  }, [id])

  return (
    <main id="content" className="courses-page">
      <div className="courses-page-header">
        <h1>Course details</h1>
        <Link to="/courses">Back to courses</Link>
      </div>

      {isLoading && <p>Loading course…</p>}

      {course && (
        <section className="course-detail-page">
          <div className="course-detail card">
            <h2>{course.course_name}</h2>
            <dl className="course-detail-list">
              <div>
                <dt>Subject</dt>
                <dd>{SUBJECT_LABELS[course.subject]}</dd>
              </div>
              <div>
                <dt>Fee</dt>
                <dd>{formatFee(course.course_fee)}</dd>
              </div>
              <div>
                <dt>Enrollment fee</dt>
                <dd>{formatFee(course.enrollment_fee)}</dd>
              </div>
              <div>
                <dt>Days</dt>
                <dd>{formatDays(course.course_days)}</dd>
              </div>
              <div>
                <dt>Capacity</dt>
                <dd>{course.capacity}</dd>
              </div>
              <div>
                <dt>Motto</dt>
                <dd>{course.course_motto ?? '—'}</dd>
              </div>
            </dl>
          </div>

          <div className="course-enrolled-students">
            <h2>Enrolled students</h2>
            {course.students.length === 0 ? (
              <p>No students enrolled yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>College</th>
                    <th>Contact</th>
                    <th>WhatsApp</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {course.students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td>{student.college ?? '—'}</td>
                      <td>{student.contact}</td>
                      <td>{student.whatsapp_number}</td>
                      <td>{student.email ?? '—'}</td>
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

export default CourseDetailPage
