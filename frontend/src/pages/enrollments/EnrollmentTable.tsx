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
  onDelete: (enrollment: Enrollment) => void
  onToggleFeePaid: (enrollment: Enrollment) => void
}

function EnrollmentTable({
  enrollments,
  studentsById,
  coursesById,
  isLoading,
  deletingId,
  updatingFeePaidId,
  onDelete,
  onToggleFeePaid,
}: EnrollmentTableProps) {
  if (isLoading) return <p>Loading enrollments…</p>
  if (enrollments.length === 0) return <p>No enrollments yet.</p>

  return (
    <table>
      <thead>
        <tr>
          <th>Student</th>
          <th>Course</th>
          <th>Start date</th>
          <th>Fee paid</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {enrollments.map((enrollment) => (
          <tr key={enrollment.id}>
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
