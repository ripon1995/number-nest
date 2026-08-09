import { request } from './client'
import type { LoginInput, RegisterInput, User, Token } from '../types/auth'

export function register(input: RegisterInput): Promise<User> {
  return request<User>('/auth/register', {
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

export function getCurrentUser(token: string): Promise<User> {
  return request<User>('/auth/me', {
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
