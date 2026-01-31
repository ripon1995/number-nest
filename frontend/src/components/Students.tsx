import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {Paper, Typography, Box, CircularProgress, Alert} from '@mui/material';
import {AppPage} from './Common-component/AppPage';
import {useStudentStore} from '../store/useStudentStore';
import {AppRoutes} from '../constants/appRoutes';
import {StudentListWithActions} from './student-components/StudentListWithActions';

export default function Students() {
    const navigate = useNavigate();
    const students = useStudentStore((state) => state.students);
    const loading = useStudentStore((state) => state.loading);
    const error = useStudentStore((state) => state.error);
    const fetchStudents = useStudentStore((state) => state.fetchStudents);

    useEffect(() => {
        fetchStudents().catch(console.error);
    }, [fetchStudents]);

    const handleBackToDashboard = () => {
        navigate(AppRoutes.DASHBOARD);
    };

    if (loading) {
        return (
            <AppPage
                headerTitle="Students"
                headerButtonText="Back to Dashboard"
                headerOnAction={handleBackToDashboard}
            >
                <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh'}}>
                    <CircularProgress/>
                </Box>
            </AppPage>
        );
    }

    return (
        <AppPage
            headerTitle="Students"
            headerButtonText="Back to Dashboard"
            headerOnAction={handleBackToDashboard}
        >
            <Paper className="view-container" elevation={2} sx={{p: 3}}>
                <Typography variant="h4" component="h1" gutterBottom>
                    All Students
                </Typography>

                {error && (
                    <Alert severity="error" sx={{mb: 2}}>
                        {error}
                    </Alert>
                )}

                <StudentListWithActions students={students}/>
            </Paper>
        </AppPage>
    );
}
