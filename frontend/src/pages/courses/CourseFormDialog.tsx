import { useState, type FormEvent } from 'react'
import Modal from '../../components/Modal'
import { useCourseStore } from '../../store/courseStore'
import { ApiError } from '../../errors/api'
import { COURSE_DAYS, COURSE_SUBJECTS } from '../../types/course'
import type { Course, CourseDay, CourseInput, CourseSubject } from '../../types/course'
import { DAY_LABELS, SUBJECT_LABELS } from './courseDisplay'
import './courses.css'

interface CourseFormDialogProps {
  course: Course | null
  onClose: () => void
  onError: (err: ApiError) => void
}

interface FormState {
  course_name: string
  course_fee: string
  subject: CourseSubject
  course_days: CourseDay[]
  capacity: string
  course_motto: string
}

const emptyForm: FormState = {
  course_name: '',
  course_fee: '',
  subject: 'math',
  course_days: [],
  capacity: '',
  course_motto: '',
}

function toFormState(course: Course): FormState {
  return {
    course_name: course.course_name,
    course_fee: course.course_fee,
    subject: course.subject,
    course_days: course.course_days,
    capacity: String(course.capacity),
    course_motto: course.course_motto ?? '',
  }
}

function CourseFormDialog({ course, onClose, onError }: CourseFormDialogProps) {
  const createCourse = useCourseStore((state) => state.createCourse)
  const updateCourse = useCourseStore((state) => state.updateCourse)

  const [form, setForm] = useState<FormState>(course ? toFormState(course) : emptyForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleDayToggle(day: CourseDay) {
    setForm((prev) => ({
      ...prev,
      course_days: prev.course_days.includes(day)
        ? prev.course_days.filter((d) => d !== day)
        : [...prev.course_days, day],
    }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)

    if (form.course_days.length === 0) {
      setFormError('Select at least one course day.')
      return
    }

    const payload: CourseInput = {
      course_name: form.course_name.trim(),
      course_fee: form.course_fee,
      subject: form.subject,
      course_days: form.course_days,
      capacity: Number(form.capacity),
      course_motto: form.course_motto.trim() || null,
    }

    setIsSubmitting(true)
    try {
      if (course) {
        await updateCourse(course.id, payload)
      } else {
        await createCourse(payload)
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
    <Modal labelledBy="course-dialog-title" onClose={onClose}>
      <form className="course-form" onSubmit={handleSubmit}>
        <h2 id="course-dialog-title">{course ? 'Edit course' : 'New course'}</h2>
        <label>
          Course name
          <input
            type="text"
            value={form.course_name}
            onChange={(e) => setForm({ ...form, course_name: e.target.value })}
            required
          />
        </label>
        <label>
          Fee
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.course_fee}
            onChange={(e) => setForm({ ...form, course_fee: e.target.value })}
            required
          />
        </label>
        <label>
          Subject
          <select
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value as CourseSubject })}
          >
            {COURSE_SUBJECTS.map((subject) => (
              <option key={subject} value={subject}>
                {SUBJECT_LABELS[subject]}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="course-days">
          <legend>Days</legend>
          {COURSE_DAYS.map((day) => (
            <label key={day} className="course-day-option">
              <input
                type="checkbox"
                checked={form.course_days.includes(day)}
                onChange={() => handleDayToggle(day)}
              />
              {DAY_LABELS[day]}
            </label>
          ))}
        </fieldset>
        <label>
          Capacity
          <input
            type="number"
            min="1"
            step="1"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            required
          />
        </label>
        <label>
          Motto (optional)
          <input
            type="text"
            value={form.course_motto}
            onChange={(e) => setForm({ ...form, course_motto: e.target.value })}
          />
        </label>
        {formError && <p className="error">{formError}</p>}
        <div className="course-form-actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : course ? 'Save changes' : 'Add course'}
          </button>
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default CourseFormDialog
