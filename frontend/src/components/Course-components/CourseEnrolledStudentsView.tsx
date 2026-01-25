// CourseEnrolledStudentsView.tsx
import {Paper, Typography} from '@mui/material';
import StudentListComponent from '../student-components/student-list-component.tsx';
import {useStudentStore} from "../../store/useStudentStore.ts";
import {useEffect} from "react";

export const CourseEnrolledStudentsView = () => {

    const students = useStudentStore((state) => state.students);
    const fetchStudents = useStudentStore((state) => state.fetchStudents);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    return (
        <Paper className="view-container" elevation={2} sx={{p: 3}}>
            <Typography variant="h4" component="h1" gutterBottom>
                Enrolled Students
            </Typography>

            <StudentListComponent students={students}></StudentListComponent>
        </Paper>
    );
};