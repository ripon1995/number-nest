import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Paper, Typography, Box, CircularProgress, Alert, Button} from '@mui/material';
import {AppPage} from './Common-component/AppPage';
import {useStudentStore} from '../store/useStudentStore';
import {AppRoutes} from '../constants/appRoutes';
import {StudentListWithActions} from './student-components/StudentListWithActions';
import {AddStudentDialog} from './Dashboard-components/AddStudentDialog';
import {primaryButtonStyles} from '../utils/formStyles';

export default function Students() {
    const navigate = useNavigate();
    const students = useStudentStore((state) => state.students);
    const loading = useStudentStore((state) => state.loading);
    const error = useStudentStore((state) => state.error);
    const fetchStudents = useStudentStore((state) => state.fetchStudents);

    const [openAddDialog, setOpenAddDialog] = useState(false);

    useEffect(() => {
        fetchStudents().catch(console.error);
    }, [fetchStudents]);

    const handleBackToDashboard = () => {
        navigate(AppRoutes.DASHBOARD);
    };

    const handleOpenAddDialog = () => {
        setOpenAddDialog(true);
    };

    const handleCloseAddDialog = () => {
        setOpenAddDialog(false);
    };

    const handleStudentCreated = async () => {
        await fetchStudents();
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
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                    <Typography variant="h4" component="h1">
                        All Students
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={handleOpenAddDialog}
                        sx={primaryButtonStyles}
                    >
                        Add Student
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{mb: 2}}>
                        {error}
                    </Alert>
                )}

                <StudentListWithActions students={students}/>
            </Paper>

            <AddStudentDialog
                open={openAddDialog}
                onClose={handleCloseAddDialog}
                onSuccess={handleStudentCreated}
            />
        </AppPage>
    );
}
