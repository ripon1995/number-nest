import { create } from 'zustand'
import * as api from '../lib/api'
import type { LoginInput, RegisterInput, Teacher } from '../types/auth'

const TOKEN_STORAGE_KEY = 'number-nest.token'

interface AuthState {
  teacher: Teacher | null
  isLoading: boolean
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  teacher: null,
  isLoading: true,

  async login(input) {
    const { access_token } = await api.login(input)
    localStorage.setItem(TOKEN_STORAGE_KEY, access_token)
    const teacher = await api.getCurrentTeacher(access_token)
    set({ teacher })
  },

  async register(input) {
    await api.register(input)
    await get().login(input)
  },

  logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    set({ teacher: null })
  },
}))

async function hydrateFromStoredToken() {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (!token) {
    useAuthStore.setState({ isLoading: false })
    return
  }

  try {
    const teacher = await api.getCurrentTeacher(token)
    useAuthStore.setState({ teacher, isLoading: false })
  } catch {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    useAuthStore.setState({ teacher: null, isLoading: false })
  }
}

hydrateFromStoredToken()
