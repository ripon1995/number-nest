import { useEffect, useState } from 'react'
import * as api from '../api'
import { useCourseStore } from '../store/courseStore'
import { useAttendanceStore } from '../store/attendanceStore'
import { ApiError } from '../errors/api'
import ErrorDialog from '../components/ErrorDialog'
import AttendanceSheet from './attendance/AttendanceSheet'
import type { CourseDetail } from '../types/course'
import type { AttendanceEntryInput } from '../types/attendance'
import './attendance/attendance.css'

function toApiError(err: unknown): ApiError {
  return err instanceof ApiError ? err : new ApiError(0, 'Something went wrong', 'Something went wrong')
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function AttendancePage() {
  const courses = useCourseStore((state) => state.courses)
  const fetchCourses = useCourseStore((state) => state.fetchCourses)

  const records = useAttendanceStore((state) => state.records)
  const fetchAttendance = useAttendanceStore((state) => state.fetchAttendance)
  const submitAttendance = useAttendanceStore((state) => state.submitAttendance)

  const [courseId, setCourseId] = useState('')
  const [sessionDate, setSessionDate] = useState(today())
  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null)
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
  const [isLoadingRecords, setIsLoadingRecords] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  useEffect(() => {
    fetchCourses().catch((err) => setError(toApiError(err)))
  }, [fetchCourses])

  useEffect(() => {
    if (!courseId && courses.length > 0) {
      setCourseId(courses[0].id)
    }
  }, [courses, courseId])

  useEffect(() => {
    if (!courseId) return
    setIsLoadingStudents(true)
    api
      .getCourse(courseId)
      .then(setCourseDetail)
      .catch((err) => setError(toApiError(err)))
      .finally(() => setIsLoadingStudents(false))
  }, [courseId])

  useEffect(() => {
    if (!courseId || !sessionDate) return
    setIsLoadingRecords(true)
    fetchAttendance(courseId, sessionDate)
      .catch((err) => setError(toApiError(err)))
      .finally(() => setIsLoadingRecords(false))
  }, [courseId, sessionDate, fetchAttendance])

  async function handleSubmit(entries: AttendanceEntryInput[]) {
    setIsSubmitting(true)
    setError(null)
    try {
      await submitAttendance({ course_id: courseId, session_date: sessionDate, entries })
    } catch (err) {
      setError(toApiError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main id="content" className="attendance-page">
      <div className="attendance-page-header">
        <h1>Attendance</h1>
      </div>

      <div className="attendance-controls">
        <label>
          Course
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            {courses.length === 0 && <option value="">No courses yet</option>}
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.course_name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Session date
          <input
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
          />
        </label>
      </div>

      {courseId && (
        <AttendanceSheet
          students={courseDetail?.students ?? []}
          records={records}
          isLoading={isLoadingStudents || isLoadingRecords}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      )}

      <ErrorDialog error={error} onClose={() => setError(null)} />
    </main>
  )
}

export default AttendancePage
