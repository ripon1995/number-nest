import type { Notice } from '../../types/notice'
import { formatDateTime } from '../notices/noticeDisplay'

interface NoticeCardProps {
  notice: Notice
  courseName: string
}

function NoticeCard({ notice, courseName }: NoticeCardProps) {
  return (
    <article className="notice-card">
      <span className="notice-card-course">{courseName}</span>
      <h3>{notice.event_name}</h3>
      <dl className="notice-card-details">
        <div>
          <dt>When</dt>
          <dd>{formatDateTime(notice.event_datetime)}</dd>
        </div>
        <div>
          <dt>Where</dt>
          <dd>{notice.event_place}</dd>
        </div>
      </dl>
    </article>
  )
}

export default NoticeCard
