import type { Student } from '../../types/student'
import { EyeIcon, PencilIcon, TrashIcon } from './StudentIcons'
import './students.css'

interface StudentTableProps {
  students: Student[]
  isLoading: boolean
  deletingId: string | null
  onViewDetail: (student: Student) => void
  onEdit: (student: Student) => void
  onDelete: (student: Student) => void
  emptyMessage?: string
}

function StudentTable({
  students,
  isLoading,
  deletingId,
  onViewDetail,
  onEdit,
  onDelete,
  emptyMessage = 'No students yet.',
}: StudentTableProps) {
  if (isLoading) return <p>Loading students…</p>
  if (students.length === 0) return <p>{emptyMessage}</p>

  return (
    <table>
      <thead>
        <tr>
          <th>SL</th>
          <th>Name</th>
          <th>College</th>
          <th>Contact</th>
          <th>WhatsApp</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {students.map((student, index) => (
          <tr key={student.id}>
            <td>{index + 1}</td>
            <td>{student.name}</td>
            <td>{student.college ?? '—'}</td>
            <td>{student.contact}</td>
            <td>{student.whatsapp_number}</td>
            <td className="student-row-actions">
              <button
                type="button"
                aria-label="View student details"
                title="Details"
                onClick={() => onViewDetail(student)}
              >
                <EyeIcon />
              </button>
              <button type="button" aria-label="Edit student" title="Edit" onClick={() => onEdit(student)}>
                <PencilIcon />
              </button>
              <button
                type="button"
                className="secondary"
                aria-label="Delete student"
                title="Delete"
                onClick={() => onDelete(student)}
                disabled={deletingId === student.id}
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

export default StudentTable
