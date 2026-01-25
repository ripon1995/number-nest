import type {Student} from "../types/student.ts";
import {create} from 'zustand';

interface StudentState {
    students: Student[];
    isLoading: boolean;
    fetchStudents: () => Promise<void>;
}

const DUMMY_STUDENTS: Student[] = [
    {
        name: "Alex Johnson",
        phone_number: "+1-555-0101",
        father_name: "Robert Johnson",
        college: "Engineering Tech",
        email: "alex.j@example.com"
    },
    {
        name: "Maria Garcia",
        phone_number: "+1-555-0102",
        father_name: "Carlos Garcia",
        college: "Arts & Science University",
        email: "m.garcia@testmail.org"
    },
    {
        name: "Liam Smith",
        phone_number: "+1-555-0103",
        father_name: "William Smith",
        college: "Northwest Polytechnic",
        email: "liam.smith@edu.com"
    },
    {
        name: "Priya Sharma",
        phone_number: "+1-555-0104",
        father_name: "Rajesh Sharma",
        college: "Global Institute of Design",
        email: "priya.s@sharma-legal.com"
    },
    {
        name: "Chen Wei",
        phone_number: "+1-555-0105",
        father_name: "Chen Hao",
        college: "Eastern Science Academy",
        email: "wei.chen@academic.net"
    },
    {
        name: "Sarah Miller",
        phone_number: "+1-555-0106",
        father_name: "Thomas Miller",
        college: "Central Valley College",
        email: "sarah.m@webmail.com"
    },
    {
        name: "Omar Haddad",
        phone_number: "+1-555-0107",
        father_name: "Amir Haddad",
        college: "Metropolitan University",
        email: "omar.h@haddad.me"
    },
    {
        name: "Elena Rossi",
        phone_number: "+1-555-0108",
        father_name: "Marco Rossi",
        college: "International Business School",
        email: "e.rossi@business.it"
    },
    {
        name: "James Wilson",
        phone_number: "+1-555-0109",
        father_name: "David Wilson",
        college: "Coastal Institute",
        email: "j.wilson@coastal.edu"
    },
    {
        name: "Aisha Khan",
        phone_number: "+1-555-0110",
        father_name: "Zubair Khan",
        college: "City Medical College",
        email: "aisha.khan@health.org"
    }
];


export const useStudentStore = create<StudentState>((set) => ({
    students: [],
    isLoading: false,
    fetchStudents: async () => {
        set({isLoading: true});
        await new Promise(resolve => setTimeout(resolve, 500));
        set({students: DUMMY_STUDENTS});

    },
}));

