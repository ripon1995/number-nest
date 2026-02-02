import type {Student} from "../types/student.ts";
import {create} from 'zustand';
import axios from 'axios';
import axiosInstance from '../utils/axiosConfig';
import {studentProfileCreateApi, courseEnrollmentApi} from '../constants/endpoints';


export interface StudentCourseEnrollmentRequestBody {
    student_profile_id: string;
    course_id: string;
}


interface StudentState {
    students: Student[];
    loading: boolean;
    error: string | null;
    fetchStudents: (course_id?: string, signal?: AbortSignal) => Promise<void>;
    courseEnrollment: (requestBody: StudentCourseEnrollmentRequestBody) => Promise<void>;
}

function parse_student_from_response(response) {
    console.log('Student list response : ', response);
    const students: Student[] = [];
    for (const item of response) {
        const student: Student = {
            id: item.id,
            college: item.college,
            email: item.email,
            father_name: item.father_name,
            father_contact: item.father_contact,
            name: item.user.name,
            phone_number: item.user.phone_number,

            // Optional fields: using the nullish coalescing operator (??)
            // to handle missing data gracefully
            course_id: item.course?.id ?? "N/A",
            course_name: item.course?.title ?? "Not Assigned"

        }
        students.push(student);
    }
    return students;
}


export const useStudentStore = create<StudentState>((set) => ({
    students: [],
    loading: false,
    error: null,
    fetchStudents: async (courseId?: string, signal?: AbortSignal) => {
        set({loading: true, error: null});
        try {
            const response = await axiosInstance.get(studentProfileCreateApi, {
                params: courseId ? {course_id: courseId} : {},
                signal
            });
            set({students: parse_student_from_response(response.data.data), loading: false});
        } catch (err) {
            // If request was aborted, reset loading state
            if (axios.isCancel(err)) {
                set({loading: false});
                return;
            }

            // Handle axios errors
            if (axios.isAxiosError(err)) {
                const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch students';
                set({error: errorMessage, loading: false});
                return;
            }

            set({error: (err as Error).message, loading: false});
        }
    },
    courseEnrollment: async (requestBody: StudentCourseEnrollmentRequestBody) => {
        set({loading: true, error: null});
        try {
            await axiosInstance.put(courseEnrollmentApi, requestBody);
            set({loading: false});
        } catch (e) {
            // If request was aborted, reset loading state
            if (axios.isCancel(e)) {
                set({loading: false});
                return;
            }

            // Handle axios errors
            if (axios.isAxiosError(e)) {
                const errorMessage = e.response?.data?.message || e.message || 'Failed to enroll student';
                set({error: errorMessage, loading: false});
                return;
            }

            set({error: (e as Error).message, loading: false});
        }
    },
}));

