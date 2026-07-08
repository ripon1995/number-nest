import type { Student } from '../../types/student'
import { PencilIcon, TrashIcon } from './StudentIcons'
import './students.css'

interface StudentTableProps {
  students: Student[]
  isLoading: boolean
  deletingId: string | null
  onEdit: (student: Student) => void
  onDelete: (student: Student) => void
}

function StudentTable({ students, isLoading, deletingId, onEdit, onDelete }: StudentTableProps) {
  if (isLoading) return <p>Loading students…</p>
  if (students.length === 0) return <p>No students yet.</p>

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>College</th>
          <th>Contact</th>
          <th>Email</th>
          <th>WhatsApp</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {students.map((student) => (
          <tr key={student.id}>
            <td>{student.name}</td>
            <td>{student.college ?? '—'}</td>
            <td>{student.contact}</td>
            <td>{student.email ?? '—'}</td>
            <td>{student.whatsapp_number}</td>
            <td className="student-row-actions">
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
