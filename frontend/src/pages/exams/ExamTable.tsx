import { useNavigate } from 'react-router-dom'
import type { Exam } from '../../types/exam'
import type { Course } from '../../types/course'
import { TrashIcon } from './ExamIcons'
import { formatDateTime } from './examDisplay'
import './exams.css'

interface ExamTableProps {
  exams: Exam[]
  coursesById: Map<string, Course>
  isLoading: boolean
  deletingId: string | null
  onDelete: (exam: Exam) => void
}

function ExamTable({ exams, coursesById, isLoading, deletingId, onDelete }: ExamTableProps) {
  const navigate = useNavigate()

  if (isLoading) return <p>Loading exams…</p>
  if (exams.length === 0) return <p>No exams scheduled yet.</p>

  return (
    <table>
      <thead>
        <tr>
          <th>SL</th>
          <th>Course</th>
          <th>Date &amp; time</th>
          <th>Description</th>
          <th>Exam mark</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {exams.map((exam, index) => (
          <tr key={exam.id} className="exam-row-clickable" onClick={() => navigate(`/exams/${exam.id}`)}>
            <td>{index + 1}</td>
            <td>{coursesById.get(exam.course_id)?.course_name ?? 'Unknown course'}</td>
            <td>{formatDateTime(exam.exam_datetime)}</td>
            <td>{exam.description ?? '—'}</td>
            <td>{exam.exam_mark}</td>
            <td className="exam-row-actions">
              <button
                type="button"
                className="secondary"
                aria-label="Delete exam"
                title="Delete"
                onClick={(event) => {
                  event.stopPropagation()
                  onDelete(exam)
                }}
                disabled={deletingId === exam.id}
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

export default ExamTable
