import { useState, type FormEvent } from 'react'
import Modal from '../../components/Modal'
import { useExamStore } from '../../store/examStore'
import { ApiError } from '../../errors/api'
import type { Exam, ExamInput, ExamUpdateInput } from '../../types/exam'
import type { Course } from '../../types/course'
import './exams.css'

interface ExamFormDialogProps {
  exam?: Exam | null
  courses: Course[]
  onClose: () => void
  onError: (err: ApiError) => void
}

interface FormState {
  course_id: string
  exam_datetime: string
  description: string
  cq_mark: string
  mcq_mark: string
}

function initialFormState(exam: Exam | null | undefined, courses: Course[]): FormState {
  if (!exam) {
    return {
      course_id: courses[0]?.id ?? '',
      exam_datetime: '',
      description: '',
      cq_mark: '',
      mcq_mark: '',
    }
  }
  return {
    course_id: exam.course_id,
    exam_datetime: exam.exam_datetime.slice(0, 16),
    description: exam.description ?? '',
    cq_mark: String(exam.cq_mark),
    mcq_mark: String(exam.mcq_mark),
  }
}

function ExamFormDialog({ exam, courses, onClose, onError }: ExamFormDialogProps) {
  const createExam = useExamStore((state) => state.createExam)
  const updateExam = useExamStore((state) => state.updateExam)
  const isEditing = exam != null

  const [form, setForm] = useState<FormState>(() => initialFormState(exam, courses))
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    setIsSubmitting(true)
    try {
      if (isEditing) {
        const payload: ExamUpdateInput = {
          exam_datetime: form.exam_datetime,
          description: form.description || null,
          cq_mark: Number(form.cq_mark),
          mcq_mark: Number(form.mcq_mark),
        }
        await updateExam(exam.id, payload)
      } else {
        const payload: ExamInput = {
          course_id: form.course_id,
          exam_datetime: form.exam_datetime,
          description: form.description || null,
          cq_mark: Number(form.cq_mark),
          mcq_mark: Number(form.mcq_mark),
        }
        await createExam(payload)
      }
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
    <Modal labelledBy="exam-dialog-title" onClose={onClose} isSubmitting={isSubmitting}>
      <form className="exam-form" onSubmit={handleSubmit}>
        <h2 id="exam-dialog-title">{isEditing ? 'Edit exam' : 'Create exam'}</h2>
        <label>
          Course
          <select
            value={form.course_id}
            onChange={(e) => setForm({ ...form, course_id: e.target.value })}
            disabled={isEditing}
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
          CQ mark
          <input
            type="number"
            min="1"
            step="1"
            value={form.cq_mark}
            onChange={(e) => setForm({ ...form, cq_mark: e.target.value })}
            required
          />
        </label>
        <label>
          MCQ mark
          <input
            type="number"
            min="1"
            step="1"
            value={form.mcq_mark}
            onChange={(e) => setForm({ ...form, mcq_mark: e.target.value })}
            required
          />
        </label>
        <div className="exam-form-actions">
          <button type="button" className="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting}>
            {isEditing ? 'Save changes' : 'Create exam'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ExamFormDialog
