import { request, authHeaders } from './client'
import type { Enrollment, EnrollmentInput } from '../types/enrollment'

export function getEnrollments(): Promise<Enrollment[]> {
  return request<Enrollment[]>('/enrollments', { headers: authHeaders() })
}

export function createEnrollment(input: EnrollmentInput): Promise<Enrollment> {
  return request<Enrollment>('/enrollments', {
    method: 'POST',
    body: JSON.stringify(input),
    headers: authHeaders(),
  })
}

export function updateEnrollmentFeePaid(id: string, enrollmentFeePaid: boolean): Promise<Enrollment> {
  return request<Enrollment>(`/enrollments/${id}/fee-paid`, {
    method: 'PATCH',
    body: JSON.stringify({ enrollment_fee_paid: enrollmentFeePaid }),
    headers: authHeaders(),
  })
}

export function updateEnrollmentDiscontinued(
  id: string,
  discontinuedAt: string | null,
): Promise<Enrollment> {
  return request<Enrollment>(`/enrollments/${id}/discontinue`, {
    method: 'PATCH',
    body: JSON.stringify({ discontinued_at: discontinuedAt }),
    headers: authHeaders(),
  })
}

export function deleteEnrollment(id: string): Promise<void> {
  return request<void>(`/enrollments/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
}
