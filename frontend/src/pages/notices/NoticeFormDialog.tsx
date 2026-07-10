import { useState, type FormEvent } from 'react'
import Modal from '../../components/Modal'
import { useNoticeStore } from '../../store/noticeStore'
import { ApiError } from '../../errors/api'
import type { NoticeInput } from '../../types/notice'
import type { Course } from '../../types/course'
import './notices.css'

interface NoticeFormDialogProps {
  courses: Course[]
  onClose: () => void
  onError: (err: ApiError) => void
}

interface FormState {
  event_name: string
  event_place: string
  event_datetime: string
  course_id: string
}

function NoticeFormDialog({ courses, onClose, onError }: NoticeFormDialogProps) {
  const createNotice = useNoticeStore((state) => state.createNotice)

  const [form, setForm] = useState<FormState>({
    event_name: '',
    event_place: '',
    event_datetime: '',
    course_id: courses[0]?.id ?? '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const payload: NoticeInput = {
      event_name: form.event_name,
      event_place: form.event_place,
      event_datetime: form.event_datetime,
      course_id: form.course_id,
    }

    setIsSubmitting(true)
    try {
      await createNotice(payload)
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
    <Modal labelledBy="notice-dialog-title" onClose={onClose}>
      <form className="notice-form" onSubmit={handleSubmit}>
        <h2 id="notice-dialog-title">Create notice</h2>
        <label>
          Event name
          <input
            type="text"
            value={form.event_name}
            onChange={(e) => setForm({ ...form, event_name: e.target.value })}
            required
          />
        </label>
        <label>
          Event place
          <input
            type="text"
            value={form.event_place}
            onChange={(e) => setForm({ ...form, event_place: e.target.value })}
            required
          />
        </label>
        <label>
          Date &amp; time
          <input
            type="datetime-local"
            value={form.event_datetime}
            onChange={(e) => setForm({ ...form, event_datetime: e.target.value })}
            required
          />
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
        <div className="notice-form-actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Create notice'}
          </button>
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default NoticeFormDialog
