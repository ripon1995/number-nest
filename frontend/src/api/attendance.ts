import { request, authHeaders } from './client'
import type { AttendanceRecord, AttendanceBulkInput } from '../types/attendance'

export function getAttendance(courseId: string, sessionDate?: string): Promise<AttendanceRecord[]> {
  const params = new URLSearchParams({ course_id: courseId })
  if (sessionDate) params.set('session_date', sessionDate)
  return request<AttendanceRecord[]>(`/attendance?${params.toString()}`, { headers: authHeaders() })
}

export function submitAttendance(input: AttendanceBulkInput): Promise<AttendanceRecord[]> {
  return request<AttendanceRecord[]>('/attendance/bulk', {
    method: 'POST',
    body: JSON.stringify(input),
    headers: authHeaders(),
  })
}

export function deleteAttendance(id: string): Promise<void> {
  return request<void>(`/attendance/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
}
