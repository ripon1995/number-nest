import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import * as api from '../lib/api'
import type { Teacher } from '../lib/api'

const TOKEN_STORAGE_KEY = 'number-nest.token'

interface AuthContextValue {
  teacher: Teacher | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, name: string, password: string) => Promise<void>
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

  async function login(email: string, password: string) {
    const { access_token } = await api.login(email, password)
    localStorage.setItem(TOKEN_STORAGE_KEY, access_token)
    setToken(access_token)
  }

  async function register(email: string, name: string, password: string) {
    await api.register(email, name, password)
    await login(email, password)
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
