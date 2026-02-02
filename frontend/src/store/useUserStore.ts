// src/store/useUserStore.ts
import { create } from 'zustand';
import axios from 'axios';
import axiosInstance from '../utils/axiosConfig';
import type { RegistrationData, LoginData, User, Profile, LoginResponse, ApiResponse, StudentProfileCreateData, StudentProfile, CreateStudentData } from '../types/user';
import { registrationApi, loginApi, profileApi, studentProfileCreateApi, getStudentProfileApi } from '../constants/endpoints';

interface UserState {
  user: User | null;
  profile: Profile | null;
  studentProfile: StudentProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  registerUser: (data: RegistrationData, signal?: AbortSignal) => Promise<User | null>;
  loginUser: (data: LoginData, signal?: AbortSignal) => Promise<void>;
  fetchUserProfile: (signal?: AbortSignal) => Promise<void>;
  fetchStudentProfile: (userId: string, signal?: AbortSignal) => Promise<void>;
  createStudentProfile: (data: StudentProfileCreateData, signal?: AbortSignal) => Promise<boolean>;
  updateStudentProfile: (profileId: string, data: Partial<StudentProfileCreateData>, signal?: AbortSignal) => Promise<boolean>;
  createStudentByAdmin: (data: CreateStudentData, signal?: AbortSignal) => Promise<boolean>;
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
  profile: null,
  studentProfile: null,
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  loading: false,
  error: null,
  success: false,

  registerUser: async (data: RegistrationData, signal?: AbortSignal): Promise<User | null> => {
    set({ loading: true, error: null, success: false });
    try {
      const response = await axiosInstance.post<ApiResponse>(
        registrationApi,
        data,
        {
          signal,
        }
      );

      const result = response.data;

      if (!result.success) {
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
      return null;
    } catch (err) {
      // If request was aborted, reset loading state
      if (axios.isCancel(err)) {
        set({ loading: false });
        return null;
      }

      // Handle axios errors
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
        set({ error: errorMessage, loading: false, success: false });
        return null;
      }

      set({ error: (err as Error).message, loading: false, success: false });
      return null;
    }
  },

  loginUser: async (data: LoginData, signal?: AbortSignal) => {
    set({ loading: true, error: null, success: false });
    try {
      const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
        loginApi,
        data,
        {
          signal,
        }
      );

      const result = response.data;

      if (!result.success) {
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
      if (axios.isCancel(err)) {
        set({ loading: false });
        return;
      }

      // Handle axios errors
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message || 'Login failed';
        set({ error: errorMessage, loading: false, success: false });
        return;
      }

      set({ error: (err as Error).message, loading: false, success: false });
    }
  },

  fetchUserProfile: async (signal?: AbortSignal) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get<ApiResponse<Profile>>(
        profileApi,
        {
          signal,
        }
      );

      const result = response.data;

      if (!result.success) {
        const errorMessage = result.message || 'Failed to fetch profile';
        throw new Error(errorMessage);
      }

      if (result.data) {
        set({
          profile: result.data,
          loading: false,
        });
      }
    } catch (err) {
      if (axios.isCancel(err)) {
        set({ loading: false });
        return;
      }

      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch profile';
        set({ error: errorMessage, loading: false });
        return;
      }

      set({ error: (err as Error).message, loading: false });
    }
  },

  fetchStudentProfile: async (userId: string, signal?: AbortSignal) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get<ApiResponse<StudentProfile>>(
        getStudentProfileApi(userId),
        {
          signal,
        }
      );

      const result = response.data;

      if (!result.success) {
        const errorMessage = result.message || 'Failed to fetch student profile';
        throw new Error(errorMessage);
      }

      if (result.data) {
        set({
          studentProfile: result.data,
          loading: false,
        });
      }
    } catch (err) {
      if (axios.isCancel(err)) {
        set({ loading: false });
        return;
      }

      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch student profile';
        set({ error: errorMessage, loading: false });
        return;
      }

      set({ error: (err as Error).message, loading: false });
    }
  },

  createStudentProfile: async (data: StudentProfileCreateData, signal?: AbortSignal): Promise<boolean> => {
    set({ loading: true, error: null, success: false });
    try {
      const response = await axiosInstance.post<ApiResponse<StudentProfile>>(
        studentProfileCreateApi,
        data,
        {
          signal,
        }
      );

      const result = response.data;

      if (!result.success) {
        const errorMessage = result.message || 'Failed to create profile';
        const errors = result.errors;

        if (errors && typeof errors === 'object') {
          const formattedErrors = Object.entries(errors)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
          throw new Error(formattedErrors || errorMessage);
        }

        throw new Error(errorMessage);
      }

      if (result.data) {
        set({
          studentProfile: result.data,
          success: true,
          loading: false,
        });
      }

      return true;
    } catch (err) {
      if (axios.isCancel(err)) {
        set({ loading: false });
        return false;
      }

      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to create profile';
        set({ error: errorMessage, loading: false, success: false });
        return false;
      }

      set({ error: (err as Error).message, loading: false, success: false });
      return false;
    }
  },

  updateStudentProfile: async (profileId: string, data: Partial<StudentProfileCreateData>, signal?: AbortSignal): Promise<boolean> => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.patch<ApiResponse<StudentProfile>>(
        getStudentProfileApi(profileId),
        data,
        {
          signal,
        }
      );

      const result = response.data;

      if (!result.success) {
        const errorMessage = result.message || 'Failed to update profile';
        throw new Error(errorMessage);
      }

      if (result.data) {
        set({
          studentProfile: result.data,
          loading: false,
        });
      }

      return true;
    } catch (err) {
      if (axios.isCancel(err)) {
        set({ loading: false });
        return false;
      }

      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile';
        set({ error: errorMessage, loading: false });
        return false;
      }

      set({ error: (err as Error).message, loading: false });
      return false;
    }
  },

  createStudentByAdmin: async (data: CreateStudentData, signal?: AbortSignal): Promise<boolean> => {
    set({ loading: true, error: null, success: false });
    try {
      // Step 1: Create User
      const userResponse = await axiosInstance.post<ApiResponse>(
        registrationApi,
        {
          name: data.name,
          phone_number: data.phone_number,
          password: data.password,
        },
        {
          signal,
        }
      );

      const userResult = userResponse.data;

      if (!userResult.success) {
        const errorMessage = userResult.message || 'Failed to create user';
        const errors = userResult.errors;

        if (errors && typeof errors === 'object') {
          const formattedErrors = Object.entries(errors)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
          throw new Error(formattedErrors || errorMessage);
        }

        throw new Error(errorMessage);
      }

      // Step 2: Create Student Profile
      const profileResponse = await axiosInstance.post<ApiResponse<StudentProfile>>(
        studentProfileCreateApi,
        {
          father_name: data.father_name,
          father_contact: data.father_contact,
          college: data.college,
          email: data.email,
        },
        {
          signal,
        }
      );

      const profileResult = profileResponse.data;

      if (!profileResult.success) {
        const errorMessage = profileResult.message || 'Failed to create student profile';
        const errors = profileResult.errors;

        if (errors && typeof errors === 'object') {
          const formattedErrors = Object.entries(errors)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
          throw new Error(formattedErrors || errorMessage);
        }

        throw new Error(errorMessage);
      }

      set({ success: true, loading: false });
      return true;
    } catch (err) {
      if (axios.isCancel(err)) {
        set({ loading: false });
        return false;
      }

      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to create student';
        set({ error: errorMessage, loading: false, success: false });
        return false;
      }

      set({ error: (err as Error).message, loading: false, success: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    set({
      user: null,
      profile: null,
      studentProfile: null,
      accessToken: null,
      refreshToken: null,
      error: null,
      success: false,
    });
  },

  resetState: () => set({ loading: false, error: null, success: false }),
}));