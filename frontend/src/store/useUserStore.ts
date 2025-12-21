// src/store/useUserStore.ts
import { create } from 'zustand';
import type { RegistrationData, ApiResponse } from '../types/user';
import { registrationApi } from '../constants/endpoints';

interface UserState {
  loading: boolean;
  error: string | null;
  success: boolean;
  registerUser: (data: RegistrationData, signal?: AbortSignal) => Promise<void>;
  resetState: () => void;
}

export const useUserStore = create<UserState>((set) => ({
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
  resetState: () => set({ loading: false, error: null, success: false }),
}));