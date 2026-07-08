export interface Enrollment {
  id: string
  student_id: string
  course_id: string
  start_from: string
  created_at: string
}

export interface EnrollmentInput {
  student_id: string
  course_id: string
  start_from: string
}
