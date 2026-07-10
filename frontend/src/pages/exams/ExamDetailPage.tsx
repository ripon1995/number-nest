import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as api from '../../api'
import { useMarkStore } from '../../store/markStore'
import { ApiError } from '../../errors/api'
import ErrorDialog from '../../components/ErrorDialog'
import MarkSheet from './MarkSheet'
import type { Exam } from '../../types/exam'
import type { CourseDetail } from '../../types/course'
import type { MarkEntryInput } from '../../types/mark'
import { formatDateTime } from './examDisplay'
import './exams.css'

function toApiError(err: unknown): ApiError {
  return err instanceof ApiError ? err : new ApiError(0, 'Something went wrong', 'Something went wrong')
}

function ExamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [exam, setExam] = useState<Exam | null>(null)
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const records = useMarkStore((state) => state.records)
  const isLoadingMarks = useMarkStore((state) => state.isLoading)
  const fetchMarks = useMarkStore((state) => state.fetchMarks)
  const submitMarks = useMarkStore((state) => state.submitMarks)

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    api
      .getExam(id)
      .then((fetchedExam) => {
        setExam(fetchedExam)
        return api.getCourse(fetchedExam.course_id)
      })
      .then(setCourse)
      .catch((err) => setError(toApiError(err)))
      .finally(() => setIsLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    fetchMarks(id).catch((err) => setError(toApiError(err)))
  }, [id, fetchMarks])

  async function handleSubmit(entries: MarkEntryInput[]) {
    if (!id) return
    setIsSubmitting(true)
    setError(null)
    try {
      await submitMarks({ exam_id: id, entries })
    } catch (err) {
      setError(toApiError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main id="content" className="exams-page">
      <div className="exams-page-header">
        <h1>Exam details</h1>
        <Link to="/exams">Back to exams</Link>
      </div>

      {isLoading && <p>Loading exam…</p>}

      {exam && (
        <section className="exam-detail-page">
          <div className="exam-detail card">
            <h2>{course?.course_name ?? 'Unknown course'}</h2>
            <dl className="exam-detail-list">
              <div>
                <dt>Date &amp; time</dt>
                <dd>{formatDateTime(exam.exam_datetime)}</dd>
              </div>
              <div>
                <dt>Description</dt>
                <dd>{exam.description ?? '—'}</dd>
              </div>
              <div>
                <dt>Exam mark</dt>
                <dd>{exam.exam_mark}</dd>
              </div>
            </dl>
          </div>

          <div className="exam-marks">
            <h2>Student marks</h2>
            <MarkSheet
              students={course?.students ?? []}
              records={records}
              isLoading={isLoading || isLoadingMarks}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          </div>
        </section>
      )}

      <ErrorDialog error={error} onClose={() => setError(null)} />
    </main>
  )
}

export default ExamDetailPage
