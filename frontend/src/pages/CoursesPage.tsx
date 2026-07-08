import { useEffect, useState, type FormEvent } from 'react'
import { useCourseStore } from '../store/courseStore'
import { ApiError } from '../errors/api'
import ErrorDialog from '../components/ErrorDialog'
import { COURSE_DAYS, COURSE_SUBJECTS } from '../types/course'
import type { Course, CourseDay, CourseInput, CourseSubject } from '../types/course'
import './CoursesPage.css'

const DAY_LABELS: Record<CourseDay, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
}

const SUBJECT_LABELS: Record<CourseSubject, string> = {
  math: 'Math',
  ict: 'ICT',
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

function CoursesPage() {
  const courses = useCourseStore((state) => state.courses)
  const isLoading = useCourseStore((state) => state.isLoading)
  const fetchCourses = useCourseStore((state) => state.fetchCourses)
  const createCourse = useCourseStore((state) => state.createCourse)
  const updateCourse = useCourseStore((state) => state.updateCourse)
  const deleteCourse = useCourseStore((state) => state.deleteCourse)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchCourses().catch((err) =>
      setError(err instanceof ApiError ? err : new ApiError(0, 'Something went wrong', 'Something went wrong')),
    )
  }, [fetchCourses])

  function handleDayToggle(day: CourseDay) {
    setForm((prev) => ({
      ...prev,
      course_days: prev.course_days.includes(day)
        ? prev.course_days.filter((d) => d !== day)
        : [...prev.course_days, day],
    }))
  }

  function startEdit(course: Course) {
    setEditingId(course.id)
    setForm(toFormState(course))
    setFormError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
    setFormError(null)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    setError(null)

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
      if (editingId) {
        await updateCourse(editingId, payload)
      } else {
        await createCourse(payload)
      }
      cancelEdit()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err
          : new ApiError(0, 'Something went wrong', 'Something went wrong'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(course: Course) {
    if (!window.confirm(`Delete course "${course.course_name}"?`)) return
    setDeletingId(course.id)
    setError(null)
    try {
      await deleteCourse(course.id)
      if (editingId === course.id) cancelEdit()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err
          : new ApiError(0, 'Something went wrong', 'Something went wrong'),
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main id="content" className="courses-page">
      <h1>Courses</h1>

      <form className="course-form" onSubmit={handleSubmit}>
        <h2>{editingId ? 'Edit course' : 'New course'}</h2>
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
            {isSubmitting ? 'Saving…' : editingId ? 'Save changes' : 'Add course'}
          </button>
          {editingId && (
            <button type="button" className="secondary" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <section className="course-list">
        {isLoading ? (
          <p>Loading courses…</p>
        ) : courses.length === 0 ? (
          <p>No courses yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Subject</th>
                <th>Fee</th>
                <th>Days</th>
                <th>Capacity</th>
                <th>Motto</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>{course.course_name}</td>
                  <td>{SUBJECT_LABELS[course.subject]}</td>
                  <td>{course.course_fee}</td>
                  <td>{course.course_days.map((d) => DAY_LABELS[d]).join(', ')}</td>
                  <td>{course.capacity}</td>
                  <td>{course.course_motto ?? '—'}</td>
                  <td className="course-row-actions">
                    <button type="button" onClick={() => startEdit(course)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => handleDelete(course)}
                      disabled={deletingId === course.id}
                    >
                      {deletingId === course.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <ErrorDialog error={error} onClose={() => setError(null)} />
    </main>
  )
}

export default CoursesPage
