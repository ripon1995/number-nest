import { useState, type FormEvent } from 'react'
import Modal from '../../components/Modal'
import { useEnrollmentStore } from '../../store/enrollmentStore'
import { ApiError } from '../../errors/api'
import type { EnrollmentInput } from '../../types/enrollment'
import type { Student } from '../../types/student'
import type { Course } from '../../types/course'
import './enrollments.css'

interface EnrollmentFormDialogProps {
  students: Student[]
  courses: Course[]
  onClose: () => void
  onError: (err: ApiError) => void
}

interface FormState {
  student_id: string
  course_id: string
  start_from: string
}

function EnrollmentFormDialog({ students, courses, onClose, onError }: EnrollmentFormDialogProps) {
  const createEnrollment = useEnrollmentStore((state) => state.createEnrollment)

  const [form, setForm] = useState<FormState>({
    student_id: students[0]?.id ?? '',
    course_id: courses[0]?.id ?? '',
    start_from: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const payload: EnrollmentInput = {
      student_id: form.student_id,
      course_id: form.course_id,
      start_from: form.start_from,
    }

    setIsSubmitting(true)
    try {
      await createEnrollment(payload)
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
    <Modal labelledBy="enrollment-dialog-title" onClose={onClose} className="enrollment-modal">
      <form className="enrollment-form" onSubmit={handleSubmit}>
        <h2 id="enrollment-dialog-title">New enrollment</h2>
        <label>
          Student
          <select
            value={form.student_id}
            onChange={(e) => setForm({ ...form, student_id: e.target.value })}
            required
          >
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </label>
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
          Start date
          <input
            type="date"
            value={form.start_from}
            onChange={(e) => setForm({ ...form, start_from: e.target.value })}
            required
          />
        </label>
        <div className="enrollment-form-actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Add enrollment'}
          </button>
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default EnrollmentFormDialog
