import { request, authHeaders } from './client'
import type { MarkRecord, MarkBulkInput } from '../types/mark'

export function getMarks(examId: string): Promise<MarkRecord[]> {
  const params = new URLSearchParams({ exam_id: examId })
  return request<MarkRecord[]>(`/marks?${params.toString()}`, { headers: authHeaders() })
}

export function submitMarks(input: MarkBulkInput): Promise<MarkRecord[]> {
  return request<MarkRecord[]>('/marks/bulk', {
    method: 'POST',
    body: JSON.stringify(input),
    headers: authHeaders(),
  })
}

export function deleteMark(id: string): Promise<void> {
  return request<void>(`/marks/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
}
