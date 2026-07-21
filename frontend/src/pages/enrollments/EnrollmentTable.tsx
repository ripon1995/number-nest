import type { Enrollment } from '../../types/enrollment'
import type { Student } from '../../types/student'
import type { Course } from '../../types/course'
import { TrashIcon } from './EnrollmentIcons'
import './enrollments.css'

interface EnrollmentTableProps {
  enrollments: Enrollment[]
  studentsById: Map<string, Student>
  coursesById: Map<string, Course>
  isLoading: boolean
  deletingId: string | null
  updatingFeePaidId: string | null
  updatingDiscontinuedId: string | null
  onDelete: (enrollment: Enrollment) => void
  onToggleFeePaid: (enrollment: Enrollment) => void
  onDiscontinuedChange: (enrollment: Enrollment, discontinuedAt: string | null) => void
  emptyMessage?: string
}

function EnrollmentTable({
  enrollments,
  studentsById,
  coursesById,
  isLoading,
  deletingId,
  updatingFeePaidId,
  updatingDiscontinuedId,
  onDelete,
  onToggleFeePaid,
  onDiscontinuedChange,
  emptyMessage,
}: EnrollmentTableProps) {
  if (isLoading) return <p>Loading enrollments…</p>
  if (enrollments.length === 0) return <p>{emptyMessage ?? 'No enrollments yet.'}</p>

  return (
    <table>
      <thead>
        <tr>
          <th>SL</th>
          <th>Student</th>
          <th>Course</th>
          <th>Start date</th>
          <th>Enrollment Fee paid</th>
          <th>Discontinued from</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {enrollments.map((enrollment, index) => (
          <tr key={enrollment.id}>
            <td>{index + 1}</td>
            <td>{studentsById.get(enrollment.student_id)?.name ?? 'Unknown student'}</td>
            <td>{coursesById.get(enrollment.course_id)?.course_name ?? 'Unknown course'}</td>
            <td>{enrollment.start_from}</td>
            <td>
              <input
                type="checkbox"
                aria-label="Enrollment fee paid"
                checked={enrollment.enrollment_fee_paid}
                onChange={() => onToggleFeePaid(enrollment)}
                disabled={updatingFeePaidId === enrollment.id}
              />
            </td>
            <td>
              <input
                type="date"
                aria-label="Discontinued from"
                value={enrollment.discontinued_at ?? ''}
                onChange={(e) => onDiscontinuedChange(enrollment, e.target.value || null)}
                disabled={updatingDiscontinuedId === enrollment.id}
              />
            </td>
            <td className="enrollment-row-actions">
              <button
                type="button"
                className="secondary"
                aria-label="Remove enrollment"
                title="Remove"
                onClick={() => onDelete(enrollment)}
                disabled={deletingId === enrollment.id}
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

export default EnrollmentTable
