import { useEffect, useState } from 'react'
import type { Student } from '../../types/student'
import type { AttendanceRecord, AttendanceEntryInput } from '../../types/attendance'
import './attendance.css'

interface AttendanceSheetProps {
  students: Student[]
  records: AttendanceRecord[]
  isLoading: boolean
  isSubmitting: boolean
  onSubmit: (entries: AttendanceEntryInput[]) => void
}

function AttendanceSheet({ students, records, isLoading, isSubmitting, onSubmit }: AttendanceSheetProps) {
  const [presentByStudentId, setPresentByStudentId] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const recordsByStudentId = new Map(records.map((record) => [record.student_id, record.present]))
    const initial: Record<string, boolean> = {}
    for (const student of students) {
      initial[student.id] = recordsByStudentId.get(student.id) ?? true
    }
    setPresentByStudentId(initial)
  }, [students, records])

  function toggle(studentId: string) {
    setPresentByStudentId((prev) => ({ ...prev, [studentId]: !prev[studentId] }))
  }

  function handleSubmit() {
    onSubmit(students.map((student) => ({ student_id: student.id, present: presentByStudentId[student.id] ?? true })))
  }

  if (isLoading) return <p>Loading students…</p>
  if (students.length === 0) return <p>This course has no enrolled students yet.</p>

  return (
    <div className="attendance-sheet">
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Present</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.name}</td>
              <td>
                <input
                  type="checkbox"
                  checked={presentByStudentId[student.id] ?? true}
                  onChange={() => toggle(student.id)}
                  aria-label={`${student.name} present`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="attendance-sheet-actions">
        <button type="button" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Submit attendance'}
        </button>
      </div>
    </div>
  )
}

export default AttendanceSheet
