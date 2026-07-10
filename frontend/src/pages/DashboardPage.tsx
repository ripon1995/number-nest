import { useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useCourseStore } from '../store/courseStore'
import * as api from '../api'
import { ApiError } from '../errors/api'
import ErrorDialog from '../components/ErrorDialog'
import AttendanceDonut from '../components/charts/AttendanceDonut'
import BarChart, { type BarDatum } from '../components/charts/BarChart'
import type { CourseDetail } from '../types/course'
import type { Exam } from '../types/exam'
import type { AttendanceRecord } from '../types/attendance'
import type { MarkRecord } from '../types/mark'
import { formatDateTime, formatShortDate } from './dashboard/dashboardDisplay'
import './dashboard/dashboard.css'

function toApiError(err: unknown): ApiError {
  return err instanceof ApiError ? err : new ApiError(0, 'Something went wrong', 'Something went wrong')
}

function countAttendance(records: AttendanceRecord[]): { present: number; absent: number } {
  const present = records.filter((record) => record.present).length
  return { present, absent: records.length - present }
}

function buildAverageMarksData(exams: Exam[], marksByExam: Record<string, MarkRecord[]>): BarDatum[] {
  const data: BarDatum[] = []
  for (const exam of exams) {
    const records = marksByExam[exam.id] ?? []
    if (records.length === 0) continue
    const average = Math.round((records.reduce((sum, r) => sum + r.mark, 0) / records.length) * 10) / 10
    data.push({
      key: exam.id,
      label: formatShortDate(exam.exam_datetime),
      value: average,
      tooltip: `${formatDateTime(exam.exam_datetime)}: average ${average} / ${exam.exam_mark}`,
    })
  }
  return data
}

function buildStudentMarksData(exams: Exam[], marksByExam: Record<string, MarkRecord[]>, studentId: string): BarDatum[] {
  const data: BarDatum[] = []
  for (const exam of exams) {
    const record = (marksByExam[exam.id] ?? []).find((r) => r.student_id === studentId)
    if (!record) continue
    data.push({
      key: exam.id,
      label: formatShortDate(exam.exam_datetime),
      value: record.mark,
      tooltip: `${formatDateTime(exam.exam_datetime)}: ${record.mark} / ${exam.exam_mark}`,
    })
  }
  return data
}

function DashboardPage() {
  const teacher = useAuthStore((state) => state.teacher)
  const courses = useCourseStore((state) => state.courses)
  const fetchCourses = useCourseStore((state) => state.fetchCourses)

  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [marksByExam, setMarksByExam] = useState<Record<string, MarkRecord[]>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  useEffect(() => {
    fetchCourses().catch((err) => setError(toApiError(err)))
  }, [fetchCourses])

  useEffect(() => {
    if (!selectedCourseId) {
      setCourseDetail(null)
      setAttendance([])
      setExams([])
      setMarksByExam({})
      return
    }

    let cancelled = false
    setSelectedStudentId('')
    setIsLoading(true)

    async function load() {
      try {
        const [detail, attendanceRecords, examList] = await Promise.all([
          api.getCourse(selectedCourseId),
          api.getAttendance(selectedCourseId),
          api.getExams(selectedCourseId),
        ])
        const sortedExams = [...examList].sort((a, b) => a.exam_datetime.localeCompare(b.exam_datetime))
        const markEntries = await Promise.all(
          sortedExams.map(async (exam) => [exam.id, await api.getMarks(exam.id)] as const),
        )
        if (cancelled) return
        setCourseDetail(detail)
        setAttendance(attendanceRecords)
        setExams(sortedExams)
        setMarksByExam(Object.fromEntries(markEntries))
      } catch (err) {
        if (!cancelled) setError(toApiError(err))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [selectedCourseId])

  const courseAttendance = useMemo(() => countAttendance(attendance), [attendance])
  const courseMarksData = useMemo(() => buildAverageMarksData(exams, marksByExam), [exams, marksByExam])

  const selectedStudent = courseDetail?.students.find((student) => student.id === selectedStudentId) ?? null

  const studentAttendance = useMemo(
    () => countAttendance(attendance.filter((record) => record.student_id === selectedStudentId)),
    [attendance, selectedStudentId],
  )
  const studentMarksData = useMemo(
    () => buildStudentMarksData(exams, marksByExam, selectedStudentId),
    [exams, marksByExam, selectedStudentId],
  )

  return (
    <main id="content" className="dashboard-page">
      <h1>Number Nest</h1>
      <p>Welcome back, {teacher?.name}.</p>

      {courses.length === 0 ? (
        <p className="dashboard-hint">Add a course to see attendance and exam analytics.</p>
      ) : (
        <>
          <div className="dashboard-filters">
            <label>
              Course
              <select value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)}>
                <option value="">Select a course…</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.course_name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Student
              <select
                value={selectedStudentId}
                onChange={(event) => setSelectedStudentId(event.target.value)}
                disabled={!courseDetail || courseDetail.students.length === 0}
              >
                <option value="">All students</option>
                {courseDetail?.students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {!selectedCourseId && <p className="dashboard-hint">Select a course to see attendance and exam analytics.</p>}

          {isLoading && <p className="dashboard-hint">Loading analytics…</p>}

          {courseDetail && !isLoading && (
            <section className="dashboard-section">
              <h2>{courseDetail.course_name}</h2>
              <div className="dashboard-charts">
                <AttendanceDonut
                  title="Course attendance"
                  present={courseAttendance.present}
                  absent={courseAttendance.absent}
                  emptyMessage="No attendance recorded yet for this course."
                />
                <BarChart
                  title="Average mark per exam"
                  data={courseMarksData}
                  emptyMessage="No marks recorded yet for this course's exams."
                />
              </div>
            </section>
          )}

          {selectedStudent && !isLoading && (
            <section className="dashboard-section">
              <h2>{selectedStudent.name}</h2>
              <div className="dashboard-charts">
                <AttendanceDonut
                  title={`${selectedStudent.name}'s attendance`}
                  present={studentAttendance.present}
                  absent={studentAttendance.absent}
                  emptyMessage="No attendance recorded yet for this student."
                />
                <BarChart
                  title={`${selectedStudent.name}'s marks per exam`}
                  data={studentMarksData}
                  emptyMessage="No marks recorded yet for this student."
                />
              </div>
            </section>
          )}
        </>
      )}

      <ErrorDialog error={error} onClose={() => setError(null)} />
    </main>
  )
}

export default DashboardPage
