import axios from 'axios';
import {create} from 'zustand';
import type {Course} from '../types/course';
import {courseListCreateApi} from '../constants/endpoints';
import {useUserStore} from './useUserStore';

interface CourseState {
    courses: Course[];
    loading: boolean;
    error: string | null;
    fetchCourses: (signal?: AbortSignal) => Promise<void>;
    addCourse: (courseData: Omit<Course, 'id'>) => Promise<Course | null>;
}

export const useCourseStore = create<CourseState>((set) => ({
    courses: [],
    loading: false,
    error: null,
    fetchCourses: async (signal?: AbortSignal) => {
        const token = useUserStore.getState().accessToken;
        set({loading: true, error: null});
        try {
            const response = await fetch(courseListCreateApi, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // 2. Add the Authorization header
                    ...(token && {'Authorization': `Bearer ${token}`}),
                }, signal
            });
            if (!response.ok) throw new Error('Failed to fetch courses');
            const result = await response.json();
            set({courses: result.data, loading: false});
        } catch (err) {
            // If request was aborted, reset loading state
            if ((err as Error).name === 'AbortError') {
                set({loading: false});
                return;
            }
            set({error: (err as Error).message, loading: false});
        }
    },

    addCourse: async (courseData: Omit<Course, 'id'>): Promise<Course | null> => {
        const token = useUserStore.getState().accessToken;

        // Optional: set a creating flag if you want UI feedback
        set({loading: true, error: null});

        try {
            const response = await axios.post(
                courseListCreateApi,
                courseData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && {Authorization: `Bearer ${token}`}),
                    },
                }
            );

            const newCourse = response.data; // assuming backend returns the created object

            // Optimistic + real update
            set((state) => ({
                courses: [...state.courses, newCourse],
                loading: false,
            }));

            return newCourse;

        } catch (err) {
            let errorMsg = 'Failed to create course';

            if (axios.isAxiosError(err)) {
                errorMsg =
                    err.response?.data?.detail ||
                    err.response?.data?.non_field_errors?.[0] ||
                    err.message ||
                    errorMsg;
            }

            set({error: errorMsg, loading: false});
            console.error('Add course error:', err);
            return null;
        }
    },

}));