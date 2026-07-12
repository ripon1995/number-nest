import { useEffect, useMemo, useState } from 'react'
import { usePublicStore } from '../store/publicStore'
import { ApiError } from '../errors/api'
import ErrorDialog from '../components/ErrorDialog'
import NoticeCard from './landing/NoticeCard'
import RoutineTable from './landing/RoutineTable'
import './landing/landing.css'

function toApiError(err: unknown): ApiError {
  return err instanceof ApiError ? err : new ApiError(0, 'Something went wrong', 'Something went wrong')
}

function LandingPage() {
  const courses = usePublicStore((state) => state.courses)
  const notices = usePublicStore((state) => state.notices)
  const isLoadingCourses = usePublicStore((state) => state.isLoadingCourses)
  const isLoadingNotices = usePublicStore((state) => state.isLoadingNotices)
  const fetchPublicCourses = usePublicStore((state) => state.fetchPublicCourses)
  const fetchPublicNotices = usePublicStore((state) => state.fetchPublicNotices)

  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [error, setError] = useState<ApiError | null>(null)

  useEffect(() => {
    fetchPublicCourses().catch((err) => setError(toApiError(err)))
    fetchPublicNotices().catch((err) => setError(toApiError(err)))
  }, [fetchPublicCourses, fetchPublicNotices])

  const coursesById = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses])
  const selectedCourse = selectedCourseId ? (coursesById.get(selectedCourseId) ?? null) : null

  return (
    <main id="content" className="landing-page">
      <h1>Number Nest</h1>
      <p className="landing-tagline">Upcoming notices and course routines, no login required.</p>

      <section className="landing-section">
        <h2>Notices</h2>
        {isLoadingNotices ? (
          <p className="landing-hint">Loading notices…</p>
        ) : notices.length === 0 ? (
          <p className="landing-hint">No upcoming notices right now.</p>
        ) : (
          <div className="notice-grid">
            {notices.map((notice) => (
              <NoticeCard
                key={notice.id}
                notice={notice}
                courseName={coursesById.get(notice.course_id)?.course_name ?? 'Unknown course'}
              />
            ))}
          </div>
        )}
      </section>

      <section className="landing-section landing-routine">
        <h2>Watch your routine</h2>
        <label className="landing-routine-select">
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

        {isLoadingCourses && <p className="landing-hint">Loading courses…</p>}
        {!isLoadingCourses && courses.length === 0 && (
          <p className="landing-hint">No courses have been added yet.</p>
        )}
        {selectedCourse && <RoutineTable course={selectedCourse} />}
      </section>

      <ErrorDialog error={error} onClose={() => setError(null)} />
    </main>
  )
}

export default LandingPage
