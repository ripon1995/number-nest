export interface Teacher {
  id: number
  email: string
  name: string
}

export interface Token {
  access_token: string
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
