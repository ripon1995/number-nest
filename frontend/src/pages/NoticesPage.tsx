import { useEffect, useState } from 'react'
import { useNoticeStore } from '../store/noticeStore'
import { useCourseStore } from '../store/courseStore'
import { ApiError } from '../errors/api'
import ErrorDialog from '../components/ErrorDialog'
import { PlusIcon } from '../components/Icons'
import NoticeTable from './notices/NoticeTable'
import NoticeFormDialog from './notices/NoticeFormDialog'
import type { Notice } from '../types/notice'
import './notices/notices.css'

function toApiError(err: unknown): ApiError {
  return err instanceof ApiError ? err : new ApiError(0, 'Something went wrong', 'Something went wrong')
}

function NoticesPage() {
  const notices = useNoticeStore((state) => state.notices)
  const isLoading = useNoticeStore((state) => state.isLoading)
  const fetchNotices = useNoticeStore((state) => state.fetchNotices)
  const deleteNotice = useNoticeStore((state) => state.deleteNotice)

  const courses = useCourseStore((state) => state.courses)
  const fetchCourses = useCourseStore((state) => state.fetchCourses)

  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchNotices().catch((err) => setError(toApiError(err)))
    fetchCourses().catch((err) => setError(toApiError(err)))
  }, [fetchNotices, fetchCourses])

  const coursesById = new Map(courses.map((course) => [course.id, course]))

  async function handleDelete(notice: Notice) {
    if (!window.confirm('Delete this notice?')) return
    setDeletingId(notice.id)
    setError(null)
    try {
      await deleteNotice(notice.id)
    } catch (err) {
      setError(toApiError(err))
    } finally {
      setDeletingId(null)
    }
  }

  function handleAddClick() {
    if (courses.length === 0) {
      setError(new ApiError(0, 'Nothing to post', 'Add at least one course before creating a notice.'))
      return
    }
    setIsCreating(true)
  }

  return (
    <main id="content" className="notices-page">
      <div className="notices-page-header">
        <h1>Notices</h1>
        <button type="button" onClick={handleAddClick}>
          <PlusIcon /> Add notice
        </button>
      </div>

      <section className="notice-list">
        <NoticeTable
          notices={notices}
          coursesById={coursesById}
          isLoading={isLoading}
          deletingId={deletingId}
          onDelete={handleDelete}
        />
      </section>

      {isCreating && (
        <NoticeFormDialog courses={courses} onClose={() => setIsCreating(false)} onError={setError} />
      )}

      <ErrorDialog error={error} onClose={() => setError(null)} />
    </main>
  )
}

export default NoticesPage
