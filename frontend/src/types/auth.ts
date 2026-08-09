export type UserRole = 'admin' | 'student'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

export interface Token {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  name: string
  password: string
}
