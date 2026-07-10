import type { Notice } from '../../types/notice'
import type { Course } from '../../types/course'
import { TrashIcon } from './NoticeIcons'
import { formatDateTime } from './noticeDisplay'
import './notices.css'

interface NoticeTableProps {
  notices: Notice[]
  coursesById: Map<string, Course>
  isLoading: boolean
  deletingId: string | null
  onDelete: (notice: Notice) => void
}

function NoticeTable({ notices, coursesById, isLoading, deletingId, onDelete }: NoticeTableProps) {
  if (isLoading) return <p>Loading notices…</p>
  if (notices.length === 0) return <p>No notices posted yet.</p>

  return (
    <table>
      <thead>
        <tr>
          <th>SL</th>
          <th>Event name</th>
          <th>Place</th>
          <th>Date &amp; time</th>
          <th>Course</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {notices.map((notice, index) => (
          <tr key={notice.id}>
            <td>{index + 1}</td>
            <td>{notice.event_name}</td>
            <td>{notice.event_place}</td>
            <td>{formatDateTime(notice.event_datetime)}</td>
            <td>{coursesById.get(notice.course_id)?.course_name ?? 'Unknown course'}</td>
            <td className="notice-row-actions">
              <button
                type="button"
                className="secondary"
                aria-label="Delete notice"
                title="Delete"
                onClick={() => onDelete(notice)}
                disabled={deletingId === notice.id}
              >
                <TrashIcon />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default NoticeTable
