import { useState, type FormEvent } from 'react'
import Modal from '../../components/Modal'
import { useExamStore } from '../../store/examStore'
import { ApiError } from '../../errors/api'
import type { ExamInput } from '../../types/exam'
import type { Course } from '../../types/course'
import './exams.css'

interface ExamFormDialogProps {
  courses: Course[]
  onClose: () => void
  onError: (err: ApiError) => void
}

interface FormState {
  course_id: string
  exam_datetime: string
  description: string
  exam_mark: string
}

function ExamFormDialog({ courses, onClose, onError }: ExamFormDialogProps) {
  const createExam = useExamStore((state) => state.createExam)

  const [form, setForm] = useState<FormState>({
    course_id: courses[0]?.id ?? '',
    exam_datetime: '',
    description: '',
    exam_mark: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const payload: ExamInput = {
      course_id: form.course_id,
      exam_datetime: form.exam_datetime,
      description: form.description || null,
      exam_mark: Number(form.exam_mark),
    }

    setIsSubmitting(true)
    try {
      await createExam(payload)
      onClose()
    } catch (err) {
      onError(
        err instanceof ApiError
          ? err
          : new ApiError(0, 'Something went wrong', 'Something went wrong'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal labelledBy="exam-dialog-title" onClose={onClose}>
      <form className="exam-form" onSubmit={handleSubmit}>
        <h2 id="exam-dialog-title">Create exam</h2>
        <label>
          Course
          <select
            value={form.course_id}
            onChange={(e) => setForm({ ...form, course_id: e.target.value })}
            required
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.course_name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date &amp; time
          <input
            type="datetime-local"
            value={form.exam_datetime}
            onChange={(e) => setForm({ ...form, exam_datetime: e.target.value })}
            required
          />
        </label>
        <label>
          Description
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
          />
        </label>
        <label>
          Exam mark
          <input
            type="number"
            min="1"
            step="1"
            value={form.exam_mark}
            onChange={(e) => setForm({ ...form, exam_mark: e.target.value })}
            required
          />
        </label>
        <div className="exam-form-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Create exam'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ExamFormDialog
