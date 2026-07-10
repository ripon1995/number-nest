import { useEffect, useState } from 'react'
import type { Student } from '../../types/student'
import type { MarkRecord, MarkEntryInput } from '../../types/mark'
import './exams.css'

interface MarkSheetProps {
  students: Student[]
  records: MarkRecord[]
  isLoading: boolean
  isSubmitting: boolean
  onSubmit: (entries: MarkEntryInput[]) => void
}

function MarkSheet({ students, records, isLoading, isSubmitting, onSubmit }: MarkSheetProps) {
  const [markByStudentId, setMarkByStudentId] = useState<Record<string, string>>({})

  useEffect(() => {
    const recordsByStudentId = new Map(records.map((record) => [record.student_id, record.mark]))
    const initial: Record<string, string> = {}
    for (const student of students) {
      const existing = recordsByStudentId.get(student.id)
      initial[student.id] = existing === undefined ? '' : String(existing)
    }
    setMarkByStudentId(initial)
  }, [students, records])

  function setMark(studentId: string, value: string) {
    setMarkByStudentId((prev) => ({ ...prev, [studentId]: value }))
  }

  function handleSubmit() {
    onSubmit(
      students.map((student) => ({
        student_id: student.id,
        mark: Number(markByStudentId[student.id] || 0),
      })),
    )
  }

  if (isLoading) return <p>Loading students…</p>
  if (students.length === 0) return <p>This course has no enrolled students yet.</p>

  return (
    <div className="mark-sheet">
      <table>
        <thead>
          <tr>
            <th>SL</th>
            <th>Student</th>
            <th>Mark</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={student.id}>
              <td>{index + 1}</td>
              <td>{student.name}</td>
              <td>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={markByStudentId[student.id] ?? ''}
                  onChange={(e) => setMark(student.id, e.target.value)}
                  aria-label={`${student.name} mark`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mark-sheet-actions">
        <button type="button" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save marks'}
        </button>
      </div>
    </div>
  )
}

export default MarkSheet
