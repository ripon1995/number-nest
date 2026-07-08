export interface AttendanceRecord {
  id: string
  enrollment_id: string
  student_id: string
  session_date: string
  present: boolean
  created_at: string
}

export interface AttendanceEntryInput {
  student_id: string
  present: boolean
}

export interface AttendanceBulkInput {
  course_id: string
  session_date: string
  entries: AttendanceEntryInput[]
}
