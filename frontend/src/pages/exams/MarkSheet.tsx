import { useEffect, useState } from 'react'
import type { Student } from '../../types/student'
import type { MarkRecord, MarkEntryInput } from '../../types/mark'
import Loader from '../../components/Loader'
import './exams.css'

interface MarkSheetProps {
  students: Student[]
  records: MarkRecord[]
  isLoading: boolean
  isSubmitting: boolean
  onSubmit: (entries: MarkEntryInput[]) => void
}

interface MarkInput {
  cq: string
  mcq: string
}

function MarkSheet({ students, records, isLoading, isSubmitting, onSubmit }: MarkSheetProps) {
  const [marksByStudentId, setMarksByStudentId] = useState<Record<string, MarkInput>>({})

  useEffect(() => {
    const recordsByStudentId = new Map(records.map((record) => [record.student_id, record]))
    const initial: Record<string, MarkInput> = {}
    for (const student of students) {
      const existing = recordsByStudentId.get(student.id)
      initial[student.id] = {
        cq: existing === undefined ? '' : String(existing.cq),
        mcq: existing === undefined ? '' : String(existing.mcq),
      }
    }
    setMarksByStudentId(initial)
  }, [students, records])

  function setMark(studentId: string, field: keyof MarkInput, value: string) {
    setMarksByStudentId((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }))
  }

  function handleSubmit() {
    onSubmit(
      students.map((student) => ({
        student_id: student.id,
        cq: Number(marksByStudentId[student.id]?.cq || 0),
        mcq: Number(marksByStudentId[student.id]?.mcq || 0),
      })),
    )
  }

  if (isLoading) return <Loader label="Loading students…" />
  if (students.length === 0) return <p>This course has no enrolled students yet.</p>

  return (
    <div className="mark-sheet">
      <table>
        <thead>
          <tr>
            <th>SL</th>
            <th>Student</th>
            <th>CQ</th>
            <th>MCQ</th>
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
                  value={marksByStudentId[student.id]?.cq ?? ''}
                  onChange={(e) => setMark(student.id, 'cq', e.target.value)}
                  aria-label={`${student.name} CQ mark`}
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={marksByStudentId[student.id]?.mcq ?? ''}
                  onChange={(e) => setMark(student.id, 'mcq', e.target.value)}
                  aria-label={`${student.name} MCQ mark`}
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
