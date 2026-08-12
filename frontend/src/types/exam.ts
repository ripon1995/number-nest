export interface Exam {
  id: string
  course_id: string
  exam_datetime: string
  description: string | null
  cq_mark: number
  mcq_mark: number
  created_at: string
}

export interface ExamInput {
  course_id: string
  exam_datetime: string
  description: string | null
  cq_mark: number
  mcq_mark: number
}

export interface ExamUpdateInput {
  exam_datetime: string
  description: string | null
  cq_mark: number
  mcq_mark: number
}
