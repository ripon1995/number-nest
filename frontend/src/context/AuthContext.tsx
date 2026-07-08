import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import * as api from '../lib/api'
import type { LoginInput, RegisterInput, Teacher } from '../types/auth'

const TOKEN_STORAGE_KEY = 'number-nest.token'

interface AuthContextValue {
  teacher: Teacher | null
  isLoading: boolean
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY),
  )
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setTeacher(null)
      setIsLoading(false)
      return
    }

    api
      .getCurrentTeacher(token)
      .then(setTeacher)
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        setToken(null)
        setTeacher(null)
      })
      .finally(() => setIsLoading(false))
  }, [token])

  async function login(input: LoginInput) {
    const { access_token } = await api.login(input)
    localStorage.setItem(TOKEN_STORAGE_KEY, access_token)
    setToken(access_token)
  }

  async function register(input: RegisterInput) {
    await api.register(input)
    await login(input)
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setToken(null)
    setTeacher(null)
  }

  return (
    <AuthContext.Provider value={{ teacher, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
