// src/store/useCourseStore.ts
import { create } from 'zustand';
import type { Course } from '../types/course';
import { courseListApi } from '../constants/endpoints';

interface CourseState {
  courses: Course[];
  loading: boolean;
  error: string | null;
  fetchCourses: (signal?: AbortSignal) => Promise<void>;
}

export const useCourseStore = create<CourseState>((set) => ({
  courses: [],
  loading: false,
  error: null,
  fetchCourses: async (signal?: AbortSignal) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(courseListApi, { signal });
      if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      set({ courses: data, loading: false });
    } catch (err) {
      // If request was aborted, reset loading state
      if ((err as Error).name === 'AbortError') {
        set({ loading: false });
        return;
      }
      set({ error: (err as Error).message, loading: false });
    }
  },
}));