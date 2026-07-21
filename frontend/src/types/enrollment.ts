export interface Enrollment {
  id: string
  student_id: string
  course_id: string
  start_from: string
  enrollment_fee_paid: boolean
  discontinued_at: string | null
  created_at: string
}

export interface EnrollmentInput {
  student_id: string
  course_id: string
  start_from: string
  enrollment_fee_paid: boolean
}
