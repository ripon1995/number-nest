// src/store/useUserStore.ts
import { create } from 'zustand';
import type { RegistrationData, LoginData, User, LoginResponse, ApiResponse } from '../types/user';
import { registrationApi, loginApi } from '../constants/endpoints';

interface UserState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  registerUser: (data: RegistrationData, signal?: AbortSignal) => Promise<void>;
  loginUser: (data: LoginData, signal?: AbortSignal) => Promise<void>;
  logout: () => void;
  resetState: () => void;
}

const getUserFromStorage = (): User | null => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  }
  return null;
};

export const useUserStore = create<UserState>((set) => ({
  user: getUserFromStorage(),
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  loading: false,
  error: null,
  success: false,

  registerUser: async (data: RegistrationData, signal?: AbortSignal) => {
    set({ loading: true, error: null, success: false });
    try {
      const response = await fetch(registrationApi, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal,
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        const errorMessage = result.message || 'Registration failed';
        const errors = result.errors;

        // Format errors if they exist
        if (errors && typeof errors === 'object') {
          const formattedErrors = Object.entries(errors)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
          throw new Error(formattedErrors || errorMessage);
        }

        throw new Error(errorMessage);
      }

      set({ success: true, loading: false });
    } catch (err) {
      // If request was aborted, reset loading state
      if ((err as Error).name === 'AbortError') {
        set({ loading: false });
        return;
      }
      set({ error: (err as Error).message, loading: false, success: false });
    }
  },

  loginUser: async (data: LoginData, signal?: AbortSignal) => {
    set({ loading: true, error: null, success: false });
    try {
      const response = await fetch(loginApi, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal,
      });

      const result: ApiResponse<LoginResponse> = await response.json();

      if (!response.ok || !result.success) {
        const errorMessage = result.message || 'Login failed';
        const errors = result.errors;

        // Format errors if they exist
        if (errors && typeof errors === 'object') {
          const formattedErrors = Object.entries(errors)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
          throw new Error(formattedErrors || errorMessage);
        }

        throw new Error(errorMessage);
      }

      // Store tokens and user data
      if (result.data) {
        localStorage.setItem('access_token', result.data.access);
        localStorage.setItem('refresh_token', result.data.refresh);
        localStorage.setItem('user', JSON.stringify(result.data.user));

        set({
          user: result.data.user,
          accessToken: result.data.access,
          refreshToken: result.data.refresh,
          success: true,
          loading: false,
        });
      }
    } catch (err) {
      // If request was aborted, reset loading state
      if ((err as Error).name === 'AbortError') {
        set({ loading: false });
        return;
      }
      set({ error: (err as Error).message, loading: false, success: false });
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      error: null,
      success: false,
    });
  },

  resetState: () => set({ loading: false, error: null, success: false }),
}));