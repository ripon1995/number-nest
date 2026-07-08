import { useEffect, useState } from 'react'
import { useCourseStore } from '../store/courseStore'
import { ApiError } from '../errors/api'
import ErrorDialog from '../components/ErrorDialog'
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

  useEffect(() => {
    fetchCourses().catch((err) => setError(toApiError(err)))
  }, [fetchCourses])

  async function handleDelete(course: Course) {
    if (!window.confirm(`Delete course "${course.course_name}"?`)) return
    setDeletingId(course.id)
    setError(null)
    try {
      await deleteCourse(course.id)
    } catch (err) {
      setError(toApiError(err))
    } finally {
      setDeletingId(null)
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
        <h1>Courses</h1>
        <button type="button" onClick={() => setIsCreating(true)}>
          Add course
        </button>
      </div>

      <section className="course-list">
        <CourseTable
          courses={courses}
          isLoading={isLoading}
          deletingId={deletingId}
          onEdit={setEditingCourse}
          onDelete={handleDelete}
        />
      </section>

      {isFormOpen && <CourseFormDialog course={editingCourse} onClose={closeForm} onError={setError} />}

      <ErrorDialog error={error} onClose={() => setError(null)} />
    </main>
  )
}

export default CoursesPage
