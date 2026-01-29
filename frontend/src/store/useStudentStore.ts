import type {Student} from "../types/student.ts";
import {create} from 'zustand';
import axios from 'axios';
import axiosInstance from '../utils/axiosConfig';
import {studentProfileCreateApi} from '../constants/endpoints';

interface StudentState {
    students: Student[];
    loading: boolean;
    error: string | null;
    fetchStudents: (signal?: AbortSignal) => Promise<void>;
    fetchEnrolledStudents: (signal?: AbortSignal) => Promise<void>;
}

const DUMMY_STUDENTS: Student[] = [
    {
        name: "Alex Johnson",
        phone_number: "+1-555-0101",
        father_name: "Robert Johnson",
        father_contact: "+1-555-0201",
        college: "Engineering Tech",
        email: "alex.j@example.com",
        course_id: "1",
        course_name: "Mathematics Fundamentals"
    },
    {
        name: "Maria Garcia",
        phone_number: "+1-555-0102",
        father_name: "Carlos Garcia",
        father_contact: "+1-555-0202",
        college: "Arts & Science University",
        email: "m.garcia@testmail.org",
        course_id: "2",
        course_name: "Physics Advanced"
    },
    {
        name: "Liam Smith",
        phone_number: "+1-555-0103",
        father_name: "William Smith",
        father_contact: "+1-555-0203",
        college: "Northwest Polytechnic",
        email: "liam.smith@edu.com"
    },
    {
        name: "Priya Sharma",
        phone_number: "+1-555-0104",
        father_name: "Rajesh Sharma",
        father_contact: "+1-555-0204",
        college: "Global Institute of Design",
        email: "priya.s@sharma-legal.com",
        course_id: "1",
        course_name: "Mathematics Fundamentals"
    },
    {
        name: "Chen Wei",
        phone_number: "+1-555-0105",
        father_name: "Chen Hao",
        father_contact: "+1-555-0205",
        college: "Eastern Science Academy",
        email: "wei.chen@academic.net"
    },
    {
        name: "Sarah Miller",
        phone_number: "+1-555-0106",
        father_name: "Thomas Miller",
        father_contact: "+1-555-0206",
        college: "Central Valley College",
        email: "sarah.m@webmail.com",
        course_id: "3",
        course_name: "Chemistry Basics"
    },
    {
        name: "Omar Haddad",
        phone_number: "+1-555-0107",
        father_name: "Amir Haddad",
        father_contact: "+1-555-0207",
        college: "Metropolitan University",
        email: "omar.h@haddad.me"
    },
    {
        name: "Elena Rossi",
        phone_number: "+1-555-0108",
        father_name: "Marco Rossi",
        father_contact: "+1-555-0208",
        college: "International Business School",
        email: "e.rossi@business.it",
        course_id: "2",
        course_name: "Physics Advanced"
    },
    {
        name: "James Wilson",
        phone_number: "+1-555-0109",
        father_name: "David Wilson",
        father_contact: "+1-555-0209",
        college: "Coastal Institute",
        email: "j.wilson@coastal.edu"
    },
    {
        name: "Aisha Khan",
        phone_number: "+1-555-0110",
        father_name: "Zubair Khan",
        father_contact: "+1-555-0210",
        college: "City Medical College",
        email: "aisha.khan@health.org",
        course_id: "1",
        course_name: "Mathematics Fundamentals"
    }
];


function parse_student_from_response(response) {
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
            course_id: item.course_id ?? "N/A",
            course_name: item.course_name ?? "Not Assigned"

        }
        students.push(student);
    }
    return students;
}


export const useStudentStore = create<StudentState>((set) => ({
    students: [],
    loading: false,
    error: null,
    fetchStudents: async (signal?: AbortSignal) => {
        set({loading: true, error: null});
        try {
            const response = await axiosInstance.get(studentProfileCreateApi, {
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
    fetchEnrolledStudents: async (signal?: AbortSignal) => {
        set({loading: true, error: null});
        try {
            // For now, using dummy data
            // TODO: Replace with actual API call when backend endpoint is ready
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
            set({students: DUMMY_STUDENTS, loading: false});
        } catch (err) {
            if (axios.isCancel(err)) {
                set({loading: false});
                return;
            }
            set({error: (err as Error).message, loading: false});
        }
    }
}));

