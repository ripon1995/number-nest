import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import './Dashboard.css';
import {useCourseStore} from '../store/useCourseStore';
import type {Course} from '../types/course';
// import sub components
import {AppPage} from "./Common-component/AppPage.tsx";
import {CourseSection} from "./Dashboard-components/CourseSection.tsx";
import {NavigationCards} from "./Dashboard-components/NavigationCards.tsx";
import {AppRoutes} from "../constants/appRoutes.ts";
import AddCourseDialog from "./Dashboard-components/DashboardAddCourseDialogue.tsx";
import {CircularProgress, Alert, Box} from '@mui/material';

export default function Dashboard() {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const {courses, loading, error, fetchCourses} = useCourseStore();
    const navigate = useNavigate();

    const handleCourseClick = (course: Course) => {
        navigate(AppRoutes.getCoursePath(course.id), {state: {course}});
    };

    const handleSaveCourse = async (newCourseData: Omit<Course, 'id'>) => {
        const created = await useCourseStore.getState().addCourse(newCourseData);

        if (created) {
            console.log('Course created:', created);
            // Optional: show success toast, close dialog automatically, etc.
        } else {
            // Error already handled in store → you can show toast here if you want
            alert('Failed to create course. Please try again.');
        }
    };

    useEffect(() => {
        const abortController = new AbortController();

        fetchCourses(abortController.signal).catch(
            //  TODO: future
        );

        return () => {
            abortController.abort();
        };
    }, [fetchCourses]);

    if (loading) {
        return (
            <AppPage showProfileAvatar>
                <Box className="loading" sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh'}}>
                    <CircularProgress />
                </Box>
            </AppPage>
        );
    }

    if (error) {
        return (
            <AppPage showProfileAvatar>
                <Box className="error" sx={{p: 2}}>
                    <Alert severity="error">Error: {error}</Alert>
                </Box>
            </AppPage>
        );
    }

    return (
        <AppPage showProfileAvatar>
            <main className="dashboard-body">
                <CourseSection courses={courses} onCourseClick={handleCourseClick}
                               onAddCourseClick={handleOpen}></CourseSection>

                <NavigationCards />

                <AddCourseDialog
                    open={open}
                    onClose={handleClose}
                    onSave={handleSaveCourse}
                />
            </main>
        </AppPage>

    );
}