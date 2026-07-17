import { useEffect, useState } from 'react'
import * as api from '../../api'
import type { Student } from '../../types/student'
import type { AttendanceRecord } from '../../types/attendance'
import { ApiError } from '../../errors/api'
import ErrorDialog from '../../components/ErrorDialog'
import { formatSessionDate, currentMonth } from './attendanceDisplay'
import './attendance.css'

interface MonthlyAttendanceProps {
  courseId: string
  students: Student[]
}

function toApiError(err: unknown): ApiError {
  return err instanceof ApiError ? err : new ApiError(0, 'Something went wrong', 'Something went wrong')
}

function MonthlyAttendance({ courseId, students }: MonthlyAttendanceProps) {
  const [studentId, setStudentId] = useState('')
  const [month, setMonth] = useState(currentMonth())
  const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  useEffect(() => {
    if (!studentId && students.length > 0) {
      setStudentId(students[0].id)
    }
    if (students.length > 0 && !students.some((student) => student.id === studentId)) {
      setStudentId(students[0].id)
    }
  }, [students, studentId])

  useEffect(() => {
    if (!courseId) return
    setIsLoading(true)
    setError(null)
    api
      .getAttendance(courseId)
      .then(setAllRecords)
      .catch((err) => setError(toApiError(err)))
      .finally(() => setIsLoading(false))
  }, [courseId])

  const monthlyRecords = allRecords
    .filter((record) => record.student_id === studentId && record.session_date.startsWith(month))
    .sort((a, b) => a.session_date.localeCompare(b.session_date))

  const presentCount = monthlyRecords.filter((record) => record.present).length
  const totalCount = monthlyRecords.length
  const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : null

  return (
    <div className="monthly-attendance">
      <h2 className="monthly-attendance-title">Monthly attendance record</h2>

      <div className="attendance-controls">
        <label>
          Student
          <select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            {students.length === 0 && <option value="">No students enrolled</option>}
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Month
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </label>
      </div>

      {isLoading && <p>Loading attendance…</p>}

      {!isLoading && students.length === 0 && <p>This course has no enrolled students yet.</p>}

      {!isLoading && students.length > 0 && (
        <div className="attendance-sheet">
          {totalCount > 0 && (
            <p className="monthly-attendance-summary">
              Present {presentCount} of {totalCount} sessions ({percentage}%)
            </p>
          )}
          {totalCount === 0 ? (
            <p>No attendance recorded for this student in this month.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>SL</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {monthlyRecords.map((record, index) => (
                  <tr key={record.id}>
                    <td>{index + 1}</td>
                    <td>{formatSessionDate(record.session_date)}</td>
                    <td>{record.present ? 'Present' : 'Absent'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <ErrorDialog error={error} onClose={() => setError(null)} />
    </div>
  )
}

export default MonthlyAttendance
