import { request } from './client'
import type { Course } from '../types/course'
import type { Notice } from '../types/notice'

export function getPublicCourses(): Promise<Course[]> {
  return request<Course[]>('/public/courses')
}

export function getPublicNotices(): Promise<Notice[]> {
  return request<Notice[]>('/public/notices')
}
