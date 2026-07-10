export interface Notice {
  id: string
  course_id: string
  event_name: string
  event_place: string
  event_datetime: string
  created_at: string
}

export interface NoticeInput {
  course_id: string
  event_name: string
  event_place: string
  event_datetime: string
}
