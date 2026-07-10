import { useEffect, useState } from 'react'
import { useExamStore } from '../store/examStore'
import { useCourseStore } from '../store/courseStore'
import { ApiError } from '../errors/api'
import ErrorDialog from '../components/ErrorDialog'
import ExamTable from './exams/ExamTable'
import ExamFormDialog from './exams/ExamFormDialog'
import type { Exam } from '../types/exam'
import './exams/exams.css'

function toApiError(err: unknown): ApiError {
  return err instanceof ApiError ? err : new ApiError(0, 'Something went wrong', 'Something went wrong')
}

function ExamsPage() {
  const exams = useExamStore((state) => state.exams)
  const isLoading = useExamStore((state) => state.isLoading)
  const fetchExams = useExamStore((state) => state.fetchExams)
  const deleteExam = useExamStore((state) => state.deleteExam)

  const courses = useCourseStore((state) => state.courses)
  const fetchCourses = useCourseStore((state) => state.fetchCourses)

  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchExams().catch((err) => setError(toApiError(err)))
    fetchCourses().catch((err) => setError(toApiError(err)))
  }, [fetchExams, fetchCourses])

  const coursesById = new Map(courses.map((course) => [course.id, course]))

  async function handleDelete(exam: Exam) {
    if (!window.confirm('Delete this exam?')) return
    setDeletingId(exam.id)
    setError(null)
    try {
      await deleteExam(exam.id)
    } catch (err) {
      setError(toApiError(err))
    } finally {
      setDeletingId(null)
    }
  }

  function handleAddClick() {
    if (courses.length === 0) {
      setError(new ApiError(0, 'Nothing to schedule', 'Add at least one course before creating an exam.'))
      return
    }
    setIsCreating(true)
  }

  return (
    <main id="content" className="exams-page">
      <div className="exams-page-header">
        <h1>Exams</h1>
        <button type="button" onClick={handleAddClick}>
          Add exam
        </button>
      </div>

      <section className="exam-list">
        <ExamTable
          exams={exams}
          coursesById={coursesById}
          isLoading={isLoading}
          deletingId={deletingId}
          onDelete={handleDelete}
        />
      </section>

      {isCreating && (
        <ExamFormDialog courses={courses} onClose={() => setIsCreating(false)} onError={setError} />
      )}

      <ErrorDialog error={error} onClose={() => setError(null)} />
    </main>
  )
}

export default ExamsPage
