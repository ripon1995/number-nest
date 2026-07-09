import { request, authHeaders } from './client'
import type { Course, CourseDetail, CourseInput } from '../types/course'

export function getCourses(): Promise<Course[]> {
  return request<Course[]>('/courses', { headers: authHeaders() })
}

export function getCourse(id: string): Promise<CourseDetail> {
  return request<CourseDetail>(`/courses/${id}`, { headers: authHeaders() })
}

export function createCourse(input: CourseInput): Promise<Course> {
  return request<Course>('/courses', {
    method: 'POST',
    body: JSON.stringify(input),
    headers: authHeaders(),
  })
}

export function updateCourse(id: string, input: CourseInput): Promise<Course> {
  return request<Course>(`/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
    headers: authHeaders(),
  })
}

export function deleteCourse(id: string): Promise<void> {
  return request<void>(`/courses/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
}
