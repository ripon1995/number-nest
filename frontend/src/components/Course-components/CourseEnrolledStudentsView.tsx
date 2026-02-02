// CourseEnrolledStudentsView.tsx
import {Paper, Typography} from '@mui/material';
import {useParams} from 'react-router-dom'; // 1. Import useParams
import StudentListComponent from '../student-components/student-list-component.tsx';
import {useStudentStore} from "../../store/useStudentStore.ts";
import {useEffect} from "react";

export const CourseEnrolledStudentsView = () => {
    const {id} = useParams<{ id: string }>();
    const {students, fetchStudents} = useStudentStore();

    useEffect(() => {
        const controller = new AbortController();

        // Just pass the string directly as the first argument
        fetchStudents(id, controller.signal);

        return () => controller.abort();
    }, [fetchStudents, id]);

    return (
        <Paper className="view-container" elevation={2} sx={{p: 3}}>
            <Typography variant="h4" component="h1" gutterBottom>
                Enrolled Students
            </Typography>
            <StudentListComponent students={students}></StudentListComponent>
        </Paper>
    );
};