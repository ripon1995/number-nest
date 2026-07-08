import { API_URL, TOKEN_STORAGE_KEY } from '../constants/config'
import { ApiError } from '../errors/api'
import type { LoginInput, RegisterInput, Teacher, Token } from '../types/auth'
import type { Course, CourseDetail, CourseInput } from '../types/course'

function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const message = body?.message ?? response.statusText
    const detail = body?.detail ?? message
    throw new ApiError(response.status, message, detail, body?.error_code)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export function register(input: RegisterInput): Promise<Teacher> {
  return request<Teacher>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function login(input: LoginInput): Promise<Token> {
  return request<Token>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function getCurrentTeacher(token: string): Promise<Teacher> {
  return request<Teacher>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function refreshToken(refreshToken: string): Promise<Token> {
  return request<Token>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
}

export function logout(refreshToken: string): Promise<void> {
  return request<void>('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
}

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
