import { request, authHeaders } from './client'
import type { Student, StudentInput } from '../types/student'

export function getStudents(): Promise<Student[]> {
  return request<Student[]>('/students', { headers: authHeaders() })
}

export function createStudent(input: StudentInput): Promise<Student> {
  return request<Student>('/students', {
    method: 'POST',
    body: JSON.stringify(input),
    headers: authHeaders(),
  })
}

export function updateStudent(id: string, input: StudentInput): Promise<Student> {
  return request<Student>(`/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
    headers: authHeaders(),
  })
}

export function deleteStudent(id: string): Promise<void> {
  return request<void>(`/students/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
}
