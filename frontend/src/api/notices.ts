import { request, authHeaders } from './client'
import type { Notice, NoticeInput } from '../types/notice'

export function getNotices(): Promise<Notice[]> {
  return request<Notice[]>('/notices', { headers: authHeaders() })
}

export function createNotice(input: NoticeInput): Promise<Notice> {
  return request<Notice>('/notices', {
    method: 'POST',
    body: JSON.stringify(input),
    headers: authHeaders(),
  })
}

export function deleteNotice(id: string): Promise<void> {
  return request<void>(`/notices/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
}
