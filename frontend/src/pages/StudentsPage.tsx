import { useEffect, useState } from 'react'
import { useStudentStore } from '../store/studentStore'
import { ApiError } from '../errors/api'
import ErrorDialog from '../components/ErrorDialog'
import { PlusIcon } from '../components/Icons'
import StudentTable from './students/StudentTable'
import StudentFormDialog from './students/StudentFormDialog'
import type { Student } from '../types/student'
import './students/students.css'

function toApiError(err: unknown): ApiError {
  return err instanceof ApiError ? err : new ApiError(0, 'Something went wrong', 'Something went wrong')
}

function StudentsPage() {
  const students = useStudentStore((state) => state.students)
  const isLoading = useStudentStore((state) => state.isLoading)
  const fetchStudents = useStudentStore((state) => state.fetchStudents)
  const deleteStudent = useStudentStore((state) => state.deleteStudent)

  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchStudents().catch((err) => setError(toApiError(err)))
  }, [fetchStudents])

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
        <h1>Students</h1>
        <button type="button" onClick={() => setIsCreating(true)}>
          <PlusIcon /> Add student
        </button>
      </div>

      <section className="student-list">
        <StudentTable
          students={students}
          isLoading={isLoading}
          deletingId={deletingId}
          onEdit={setEditingStudent}
          onDelete={handleDelete}
        />
      </section>

      {isFormOpen && <StudentFormDialog student={editingStudent} onClose={closeForm} onError={setError} />}

      <ErrorDialog error={error} onClose={() => setError(null)} />
    </main>
  )
}

export default StudentsPage
