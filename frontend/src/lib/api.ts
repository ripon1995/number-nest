const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export interface Teacher {
  id: number
  email: string
  name: string
}

export interface Token {
  access_token: string
  token_type: string
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
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
    const message = body?.detail ?? response.statusText
    throw new ApiError(response.status, message)
  }

  return response.json() as Promise<T>
}

export function register(email: string, name: string, password: string): Promise<Teacher> {
  return request<Teacher>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, name, password }),
  })
}

export function login(email: string, password: string): Promise<Token> {
  return request<Token>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function getCurrentTeacher(token: string): Promise<Teacher> {
  return request<Teacher>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
}
