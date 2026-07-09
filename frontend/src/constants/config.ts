export const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api').replace(/\/+$/, '')

export const TOKEN_STORAGE_KEY = 'number-nest.token'
export const REFRESH_TOKEN_STORAGE_KEY = 'number-nest.refreshToken'
