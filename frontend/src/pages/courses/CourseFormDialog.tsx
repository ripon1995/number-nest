import { useState, type FormEvent } from 'react'
import Modal from '../../components/Modal'
import { useCourseStore } from '../../store/courseStore'
import { ApiError } from '../../errors/api'
import { COURSE_BATCH_TYPES, COURSE_CLASSES, COURSE_DAYS, COURSE_SUBJECTS } from '../../types/course'
import type {
  Course,
  CourseBatchType,
  CourseClass,
  CourseDay,
  CourseInput,
  CourseSubject,
} from '../../types/course'
import { BATCH_TYPE_LABELS, CLASS_LABELS, DAY_LABELS, SUBJECT_LABELS, buildCourseName } from './courseDisplay'
import './courses.css'

interface CourseFormDialogProps {
  course: Course | null
  onClose: () => void
  onError: (err: ApiError) => void
}

interface FormState {
  class_level: CourseClass
  subject: CourseSubject
  exam_year: string
  class_time: string
  batch_type: CourseBatchType
  course_fee: string
  enrollment_fee: string
  course_days: CourseDay[]
  capacity: string
  course_motto: string
  note: string
}

const emptyForm: FormState = {
  class_level: 'hsc',
  subject: 'math',
  exam_year: '',
  class_time: '',
  batch_type: 'regular',
  course_fee: '',
  enrollment_fee: '',
  course_days: [],
  capacity: '',
  course_motto: '',
  note: '',
}

function toFormState(course: Course): FormState {
  return {
    class_level: course.class_level,
    subject: course.subject,
    exam_year: String(course.exam_year),
    class_time: course.class_time.slice(0, 5),
    batch_type: course.batch_type,
    course_fee: course.course_fee,
    enrollment_fee: course.enrollment_fee,
    course_days: course.course_days,
    capacity: String(course.capacity),
    course_motto: course.course_motto ?? '',
    note: course.note ?? '',
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
      class_level: form.class_level,
      subject: form.subject,
      exam_year: Number(form.exam_year),
      class_time: form.class_time,
      batch_type: form.batch_type,
      course_fee: form.course_fee,
      enrollment_fee: form.enrollment_fee,
      course_days: form.course_days,
      capacity: Number(form.capacity),
      course_motto: form.course_motto.trim() || null,
      note: form.note.trim() || null,
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
          Class
          <select
            value={form.class_level}
            onChange={(e) => setForm({ ...form, class_level: e.target.value as CourseClass })}
          >
            {COURSE_CLASSES.map((classLevel) => (
              <option key={classLevel} value={classLevel}>
                {CLASS_LABELS[classLevel]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Exam year
          <input
            type="number"
            min="2000"
            step="1"
            value={form.exam_year}
            onChange={(e) => setForm({ ...form, exam_year: e.target.value })}
            required
          />
        </label>
        <label>
          Batch type
          <select
            value={form.batch_type}
            onChange={(e) => setForm({ ...form, batch_type: e.target.value as CourseBatchType })}
          >
            {COURSE_BATCH_TYPES.map((batchType) => (
              <option key={batchType} value={batchType}>
                {BATCH_TYPE_LABELS[batchType]}
              </option>
            ))}
          </select>
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
          Enrollment fee
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.enrollment_fee}
            onChange={(e) => setForm({ ...form, enrollment_fee: e.target.value })}
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
          Class time
          <input
            type="time"
            value={form.class_time}
            onChange={(e) => setForm({ ...form, class_time: e.target.value })}
            required
          />
        </label>
        <p className="course-name-preview">
          Course name:{' '}
          <strong>
            {buildCourseName(form.class_level, form.subject, form.exam_year, form.class_time, form.batch_type) ||
              '—'}
          </strong>
        </p>
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
        <label>
          Note (optional)
          <textarea
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            rows={3}
          />
        </label>
        {formError && <p className="error">{formError}</p>}
        <div className="course-form-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : course ? 'Save changes' : 'Add course'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default CourseFormDialog
