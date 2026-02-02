import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Paper, Typography, Box, CircularProgress, Alert, Button} from '@mui/material';
import {AppPage} from './Common-component/AppPage';
import {useCourseStore} from '../store/useCourseStore';
import {AppRoutes} from '../constants/appRoutes';
import {CourseListWithActions} from './Course-components/CourseListWithActions';
import DashboardAddCourseDialogue from './Dashboard-components/DashboardAddCourseDialogue';
import {primaryButtonStyles} from '../utils/formStyles';

export default function Courses() {
    const navigate = useNavigate();
    const courses = useCourseStore((state) => state.courses);
    const loading = useCourseStore((state) => state.loading);
    const error = useCourseStore((state) => state.error);
    const fetchCourses = useCourseStore((state) => state.fetchCourses);
    const addCourse = useCourseStore((state) => state.addCourse);

    const [openAddDialog, setOpenAddDialog] = useState(false);

    useEffect(() => {
        fetchCourses().catch(console.error);
    }, [fetchCourses]);

    const handleBackToDashboard = () => {
        navigate(AppRoutes.DASHBOARD);
    };

    const handleOpenAddDialog = () => {
        setOpenAddDialog(true);
    };

    const handleCloseAddDialog = () => {
        setOpenAddDialog(false);
    };

    const handleCourseSaved = async (data: {
        title: string;
        description: string;
        batch_days: string;
        batch_time: string;
        capacity: number;
        course_fee: number;
    }) => {
        const result = await addCourse(data);
        if (result) {
            console.log('Course created successfully');
        }
    };

    if (loading) {
        return (
            <AppPage
                headerTitle="Courses"
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
            headerTitle="Courses"
            headerButtonText="Back to Dashboard"
            headerOnAction={handleBackToDashboard}
        >
            <Paper className="view-container" elevation={2} sx={{p: 3}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                    <Typography variant="h4" component="h1">
                        All Courses
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={handleOpenAddDialog}
                        sx={primaryButtonStyles}
                    >
                        Add Course
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{mb: 2}}>
                        {error}
                    </Alert>
                )}

                <CourseListWithActions courses={courses}/>
            </Paper>

            <DashboardAddCourseDialogue
                open={openAddDialog}
                onClose={handleCloseAddDialog}
                onSave={handleCourseSaved}
            />
        </AppPage>
    );
}
