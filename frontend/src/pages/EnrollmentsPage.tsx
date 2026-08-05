import { useEffect, useState } from 'react'
import { useEnrollmentStore } from '../store/enrollmentStore'
import { useStudentStore } from '../store/studentStore'
import { useCourseStore } from '../store/courseStore'
import { ApiError } from '../errors/api'
import ErrorDialog from '../components/ErrorDialog'
import ConfirmDialog from '../components/ConfirmDialog'
import { PlusIcon } from '../components/Icons'
import { EnrollmentsIcon } from '../components/NavIcons'
import EnrollmentTable from './enrollments/EnrollmentTable'
import EnrollmentFormDialog from './enrollments/EnrollmentFormDialog'
import type { Enrollment } from '../types/enrollment'
import './enrollments/enrollments.css'

function toApiError(err: unknown): ApiError {
  return err instanceof ApiError ? err : new ApiError(0, 'Something went wrong', 'Something went wrong')
}

function EnrollmentsPage() {
  const enrollments = useEnrollmentStore((state) => state.enrollments)
  const isLoading = useEnrollmentStore((state) => state.isLoading)
  const fetchEnrollments = useEnrollmentStore((state) => state.fetchEnrollments)
  const deleteEnrollment = useEnrollmentStore((state) => state.deleteEnrollment)
  const updateEnrollmentFeePaid = useEnrollmentStore((state) => state.updateEnrollmentFeePaid)
  const updateEnrollmentDiscontinued = useEnrollmentStore((state) => state.updateEnrollmentDiscontinued)

  const students = useStudentStore((state) => state.students)
  const fetchStudents = useStudentStore((state) => state.fetchStudents)
  const courses = useCourseStore((state) => state.courses)
  const fetchCourses = useCourseStore((state) => state.fetchCourses)

  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Enrollment | null>(null)
  const [updatingFeePaidId, setUpdatingFeePaidId] = useState<string | null>(null)
  const [updatingDiscontinuedId, setUpdatingDiscontinuedId] = useState<string | null>(null)

  const [filterCourseId, setFilterCourseId] = useState('')
  const [filterStudentId, setFilterStudentId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchEnrollments().catch((err) => setError(toApiError(err)))
    fetchStudents().catch((err) => setError(toApiError(err)))
    fetchCourses().catch((err) => setError(toApiError(err)))
  }, [fetchEnrollments, fetchStudents, fetchCourses])

  const studentsById = new Map(students.map((student) => [student.id, student]))
  const coursesById = new Map(courses.map((course) => [course.id, course]))

  const trimmedSearch = searchQuery.trim().toLowerCase()

  const filteredEnrollments = enrollments.filter((enrollment) => {
    if (filterCourseId && enrollment.course_id !== filterCourseId) return false
    if (filterStudentId && enrollment.student_id !== filterStudentId) return false
    if (trimmedSearch) {
      const studentName = studentsById.get(enrollment.student_id)?.name ?? ''
      if (!studentName.toLowerCase().includes(trimmedSearch)) return false
    }
    return true
  })

  const hasActiveFilters = Boolean(filterCourseId || filterStudentId || trimmedSearch)

  function handleClearFilters() {
    setFilterCourseId('')
    setFilterStudentId('')
    setSearchQuery('')
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeletingId(pendingDelete.id)
    setError(null)
    try {
      await deleteEnrollment(pendingDelete.id)
    } catch (err) {
      setError(toApiError(err))
    } finally {
      setDeletingId(null)
      setPendingDelete(null)
    }
  }

  async function handleToggleFeePaid(enrollment: Enrollment) {
    setUpdatingFeePaidId(enrollment.id)
    setError(null)
    try {
      await updateEnrollmentFeePaid(enrollment.id, !enrollment.enrollment_fee_paid)
    } catch (err) {
      setError(toApiError(err))
    } finally {
      setUpdatingFeePaidId(null)
    }
  }

  async function handleDiscontinuedChange(enrollment: Enrollment, discontinuedAt: string | null) {
    setUpdatingDiscontinuedId(enrollment.id)
    setError(null)
    try {
      await updateEnrollmentDiscontinued(enrollment.id, discontinuedAt)
    } catch (err) {
      setError(toApiError(err))
    } finally {
      setUpdatingDiscontinuedId(null)
    }
  }

  function handleAddClick() {
    if (students.length === 0 || courses.length === 0) {
      setError(
        new ApiError(
          0,
          'Nothing to enroll',
          'Add at least one student and one course before creating an enrollment.',
        ),
      )
      return
    }
    setIsCreating(true)
  }

  return (
    <main id="content" className="enrollments-page">
      <div className="enrollments-page-header">
        <h1 className="page-title">
          <span className="app-nav-icon">
            <EnrollmentsIcon />
          </span>
          Enrollments
        </h1>
        <button type="button" onClick={handleAddClick}>
          <PlusIcon /> Add enrollment
        </button>
      </div>

      <section className="enrollment-filters">
        <label>
          Search
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Student name…"
          />
        </label>
        <label>
          Course
          <select value={filterCourseId} onChange={(e) => setFilterCourseId(e.target.value)}>
            <option value="">All courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.course_name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Student
          <select value={filterStudentId} onChange={(e) => setFilterStudentId(e.target.value)}>
            <option value="">All students</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </label>
        {hasActiveFilters && (
          <button type="button" className="secondary" onClick={handleClearFilters}>
            Clear filters
          </button>
        )}
      </section>

      <section className="enrollment-list">
        <EnrollmentTable
          enrollments={filteredEnrollments}
          studentsById={studentsById}
          coursesById={coursesById}
          isLoading={isLoading}
          deletingId={deletingId}
          updatingFeePaidId={updatingFeePaidId}
          updatingDiscontinuedId={updatingDiscontinuedId}
          onDelete={setPendingDelete}
          onToggleFeePaid={handleToggleFeePaid}
          onDiscontinuedChange={handleDiscontinuedChange}
          emptyMessage={
            hasActiveFilters ? 'No enrollments match the selected filters.' : undefined
          }
        />
      </section>

      {isCreating && (
        <EnrollmentFormDialog
          students={students}
          courses={courses}
          onClose={() => setIsCreating(false)}
          onError={setError}
        />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={
          pendingDelete
            ? `Remove ${studentsById.get(pendingDelete.student_id)?.name ?? 'this student'} from ${
                coursesById.get(pendingDelete.course_id)?.course_name ?? 'this course'
              }?`
            : ''
        }
        isConfirming={deletingId !== null}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <ErrorDialog error={error} onClose={() => setError(null)} />
    </main>
  )
}

export default EnrollmentsPage
