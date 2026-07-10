import { request, authHeaders } from './client'
import type { Exam, ExamInput } from '../types/exam'

export function getExams(courseId?: string): Promise<Exam[]> {
  const params = courseId ? `?${new URLSearchParams({ course_id: courseId }).toString()}` : ''
  return request<Exam[]>(`/exams${params}`, { headers: authHeaders() })
}

export function getExam(id: string): Promise<Exam> {
  return request<Exam>(`/exams/${id}`, { headers: authHeaders() })
}

export function createExam(input: ExamInput): Promise<Exam> {
  return request<Exam>('/exams', {
    method: 'POST',
    body: JSON.stringify(input),
    headers: authHeaders(),
  })
}

export function deleteExam(id: string): Promise<void> {
  return request<void>(`/exams/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
}
