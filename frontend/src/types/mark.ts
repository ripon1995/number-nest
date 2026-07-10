export interface MarkRecord {
  id: string
  enrollment_id: string
  student_id: string
  exam_id: string
  mark: number
  created_at: string
}

export interface MarkEntryInput {
  student_id: string
  mark: number
}

export interface MarkBulkInput {
  exam_id: string
  entries: MarkEntryInput[]
}
