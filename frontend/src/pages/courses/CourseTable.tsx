import type { Course } from '../../types/course'
import { DAY_LABELS, SUBJECT_LABELS, formatFee } from './courseDisplay'
import { EyeIcon, PencilIcon, TrashIcon } from './CourseIcons'
import './courses.css'

interface CourseTableProps {
  courses: Course[]
  isLoading: boolean
  deletingId: string | null
  onView: (course: Course) => void
  onEdit: (course: Course) => void
  onDelete: (course: Course) => void
}

function CourseTable({ courses, isLoading, deletingId, onView, onEdit, onDelete }: CourseTableProps) {
  if (isLoading) return <p>Loading courses…</p>
  if (courses.length === 0) return <p>No courses yet.</p>

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Subject</th>
          <th>Fee</th>
          <th>Days</th>
          <th>Capacity</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {courses.map((course) => (
          <tr key={course.id}>
            <td>{course.course_name}</td>
            <td>{SUBJECT_LABELS[course.subject]}</td>
            <td>{formatFee(course.course_fee)}</td>
            <td>{course.course_days.map((day) => DAY_LABELS[day]).join(', ')}</td>
            <td>{course.capacity}</td>
            <td className="course-row-actions">
              <button type="button" aria-label="View course" title="View" onClick={() => onView(course)}>
                <EyeIcon />
              </button>
              <button type="button" aria-label="Edit course" title="Edit" onClick={() => onEdit(course)}>
                <PencilIcon />
              </button>
              <button
                type="button"
                className="secondary"
                aria-label="Delete course"
                title="Delete"
                onClick={() => onDelete(course)}
                disabled={deletingId === course.id}
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

export default CourseTable
