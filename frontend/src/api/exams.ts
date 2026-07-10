import { request, authHeaders } from './client'
import type { Exam, ExamInput } from '../types/exam'

export function getExams(): Promise<Exam[]> {
  return request<Exam[]>('/exams', { headers: authHeaders() })
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
