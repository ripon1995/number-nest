import { useEffect, useState } from 'react'
import { useCourseStore } from '../store/courseStore'
import { ApiError } from '../errors/api'
import ErrorDialog from '../components/ErrorDialog'
import ConfirmDialog from '../components/ConfirmDialog'
import { PlusIcon } from '../components/Icons'
import { CoursesIcon } from '../components/NavIcons'
import CourseTable from './courses/CourseTable'
import CourseFormDialog from './courses/CourseFormDialog'
import type { Course } from '../types/course'
import './courses/courses.css'

function toApiError(err: unknown): ApiError {
  return err instanceof ApiError ? err : new ApiError(0, 'Something went wrong', 'Something went wrong')
}

function CoursesPage() {
  const courses = useCourseStore((state) => state.courses)
  const isLoading = useCourseStore((state) => state.isLoading)
  const fetchCourses = useCourseStore((state) => state.fetchCourses)
  const deleteCourse = useCourseStore((state) => state.deleteCourse)

  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Course | null>(null)

  useEffect(() => {
    fetchCourses().catch((err) => setError(toApiError(err)))
  }, [fetchCourses])

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeletingId(pendingDelete.id)
    setError(null)
    try {
      await deleteCourse(pendingDelete.id)
    } catch (err) {
      setError(toApiError(err))
    } finally {
      setDeletingId(null)
      setPendingDelete(null)
    }
  }

  const isFormOpen = isCreating || editingCourse !== null

  function closeForm() {
    setIsCreating(false)
    setEditingCourse(null)
  }

  return (
    <main id="content" className="courses-page">
      <div className="courses-page-header">
        <h1 className="page-title">
          <span className="app-nav-icon">
            <CoursesIcon />
          </span>
          Courses
        </h1>
        <button type="button" onClick={() => setIsCreating(true)}>
          <PlusIcon /> Add course
        </button>
      </div>

      <section className="course-list">
        <CourseTable
          courses={courses}
          isLoading={isLoading}
          deletingId={deletingId}
          onEdit={setEditingCourse}
          onDelete={setPendingDelete}
        />
      </section>

      {isFormOpen && <CourseFormDialog course={editingCourse} onClose={closeForm} onError={setError} />}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete course "${pendingDelete?.course_name}"?`}
        isConfirming={deletingId !== null}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <ErrorDialog error={error} onClose={() => setError(null)} />
    </main>
  )
}

export default CoursesPage
