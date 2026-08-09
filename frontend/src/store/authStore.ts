import { create } from 'zustand'
import * as api from '../api'
import { REFRESH_TOKEN_STORAGE_KEY, TOKEN_STORAGE_KEY } from '../constants/config'
import type { LoginInput, RegisterInput, User } from '../types/auth'

interface AuthState {
  user: User | null
  isLoading: boolean
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
}

function storeTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKEN_STORAGE_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken)
}

function clearTokens() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,

  async login(input) {
    const { access_token, refresh_token } = await api.login(input)
    storeTokens(access_token, refresh_token)
    const user = await api.getCurrentUser(access_token)
    set({ user })
  },

  async register(input) {
    await api.register(input)
    await get().login(input)
  },

  async logout() {
    const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
    clearTokens()
    set({ user: null })
    if (refreshTokenValue) {
      // Best-effort: the local session is already cleared either way.
      await api.logout(refreshTokenValue).catch(() => {})
    }
  },
}))

export function useIsAdmin(): boolean {
  return useAuthStore((state) => state.user?.role === 'admin')
}

async function hydrateFromStoredToken() {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
  if (!token || !refreshTokenValue) {
    clearTokens()
    useAuthStore.setState({ isLoading: false })
    return
  }

  try {
    const user = await api.getCurrentUser(token)
    useAuthStore.setState({ user, isLoading: false })
    return
  } catch {
    // Access token likely expired — fall through to refresh.
  }

  try {
    const refreshed = await api.refreshToken(refreshTokenValue)
    storeTokens(refreshed.access_token, refreshed.refresh_token)
    const user = await api.getCurrentUser(refreshed.access_token)
    useAuthStore.setState({ user, isLoading: false })
  } catch {
    clearTokens()
    useAuthStore.setState({ user: null, isLoading: false })
  }
}

api.setUnauthorizedHandler(() => {
  clearTokens()
  useAuthStore.setState({ user: null })
})

hydrateFromStoredToken()
