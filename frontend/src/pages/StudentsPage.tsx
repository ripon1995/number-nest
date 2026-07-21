import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStudentStore } from '../store/studentStore'
import { useEnrollmentStore } from '../store/enrollmentStore'
import { useCourseStore } from '../store/courseStore'
import { ApiError } from '../errors/api'
import ErrorDialog from '../components/ErrorDialog'
import { PlusIcon } from '../components/Icons'
import { StudentsIcon } from '../components/NavIcons'
import StudentTable from './students/StudentTable'
import StudentFormDialog from './students/StudentFormDialog'
import type { Student } from '../types/student'
import './students/students.css'

function toApiError(err: unknown): ApiError {
  return err instanceof ApiError ? err : new ApiError(0, 'Something went wrong', 'Something went wrong')
}

function StudentsPage() {
  const navigate = useNavigate()
  const students = useStudentStore((state) => state.students)
  const isLoading = useStudentStore((state) => state.isLoading)
  const fetchStudents = useStudentStore((state) => state.fetchStudents)
  const deleteStudent = useStudentStore((state) => state.deleteStudent)

  const enrollments = useEnrollmentStore((state) => state.enrollments)
  const fetchEnrollments = useEnrollmentStore((state) => state.fetchEnrollments)
  const courses = useCourseStore((state) => state.courses)
  const fetchCourses = useCourseStore((state) => state.fetchCourses)

  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [filterCourseId, setFilterCourseId] = useState('')
  const [filterStatus, setFilterStatus] = useState<'' | 'active' | 'inactive'>('')

  useEffect(() => {
    fetchStudents().catch((err) => setError(toApiError(err)))
    fetchEnrollments().catch((err) => setError(toApiError(err)))
    fetchCourses().catch((err) => setError(toApiError(err)))
  }, [fetchStudents, fetchEnrollments, fetchCourses])

  const hasActiveFilters = Boolean(filterCourseId || filterStatus)

  const filteredStudents = hasActiveFilters
    ? students.filter((student) =>
        enrollments.some(
          (enrollment) =>
            enrollment.student_id === student.id &&
            (!filterCourseId || enrollment.course_id === filterCourseId) &&
            (!filterStatus ||
              (filterStatus === 'active' ? !enrollment.discontinued_at : Boolean(enrollment.discontinued_at))),
        ),
      )
    : students

  function handleClearFilters() {
    setFilterCourseId('')
    setFilterStatus('')
  }

  async function handleDelete(student: Student) {
    if (!window.confirm(`Delete student "${student.name}"?`)) return
    setDeletingId(student.id)
    setError(null)
    try {
      await deleteStudent(student.id)
    } catch (err) {
      setError(toApiError(err))
    } finally {
      setDeletingId(null)
    }
  }

  const isFormOpen = isCreating || editingStudent !== null

  function closeForm() {
    setIsCreating(false)
    setEditingStudent(null)
  }

  return (
    <main id="content" className="students-page">
      <div className="students-page-header">
        <h1 className="page-title">
          <span className="app-nav-icon">
            <StudentsIcon />
          </span>
          Students
        </h1>
        <button type="button" onClick={() => setIsCreating(true)}>
          <PlusIcon /> Add student
        </button>
      </div>

      <section className="student-filters">
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
          Status
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as '' | 'active' | 'inactive')}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        {hasActiveFilters && (
          <button type="button" className="secondary" onClick={handleClearFilters}>
            Clear filters
          </button>
        )}
      </section>

      <section className="student-list">
        <StudentTable
          students={filteredStudents}
          isLoading={isLoading}
          deletingId={deletingId}
          onViewDetail={(student) => navigate(`/students/${student.id}`)}
          onEdit={setEditingStudent}
          onDelete={handleDelete}
          emptyMessage={hasActiveFilters ? 'No students match the selected filters.' : undefined}
        />
      </section>

      {isFormOpen && <StudentFormDialog student={editingStudent} onClose={closeForm} onError={setError} />}

      <ErrorDialog error={error} onClose={() => setError(null)} />
    </main>
  )
}

export default StudentsPage
