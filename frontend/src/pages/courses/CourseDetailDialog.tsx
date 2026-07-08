import Modal from '../../components/Modal'
import type { Course } from '../../types/course'
import { SUBJECT_LABELS, formatDays, formatFee } from './courseDisplay'
import './courses.css'

interface CourseDetailDialogProps {
  course: Course
  onClose: () => void
}

function CourseDetailDialog({ course, onClose }: CourseDetailDialogProps) {
  return (
    <Modal labelledBy="course-detail-title" onClose={onClose}>
      <div className="course-detail">
        <h2 id="course-detail-title">{course.course_name}</h2>
        <dl className="course-detail-list">
          <div>
            <dt>Subject</dt>
            <dd>{SUBJECT_LABELS[course.subject]}</dd>
          </div>
          <div>
            <dt>Fee</dt>
            <dd>{formatFee(course.course_fee)}</dd>
          </div>
          <div>
            <dt>Days</dt>
            <dd>{formatDays(course.course_days)}</dd>
          </div>
          <div>
            <dt>Capacity</dt>
            <dd>{course.capacity}</dd>
          </div>
          <div>
            <dt>Motto</dt>
            <dd>{course.course_motto ?? '—'}</dd>
          </div>
        </dl>
        <div className="course-form-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default CourseDetailDialog
