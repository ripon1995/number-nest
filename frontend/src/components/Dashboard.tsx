import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import './Dashboard.css';
import {useCourseStore} from '../store/useCourseStore';
// import sub components
import {DashboardHeader} from "./Dashboard-components/DashboardHeader.tsx";
import {CourseSection} from "./Dashboard-components/CourseSection.tsx";
import {AppRoutes} from "../constants/appRoutes.ts";

export default function Dashboard() {
    const {courses, loading, error, fetchCourses} = useCourseStore();
    const navigate = useNavigate();
    const handleLogout = () => {
        navigate(AppRoutes.LOGIN);
    }

    const handleCourseClick = (id: string) => {
        navigate(AppRoutes.getCoursePath(id));
    };

    useEffect(() => {
        const abortController = new AbortController();

        fetchCourses(abortController.signal).then(_r => {
        });

        return () => {
            abortController.abort();
        };
    }, [fetchCourses]);

    if (loading) {
        return (
            <div className="dashboard">
                <div className="loading">Loading courses...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard">
                <div className="error">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <DashboardHeader
                buttonText="Logout!"
                onAction={handleLogout}
            ></DashboardHeader>
            <main className="dashboard-body">
                <CourseSection courses={courses} onCourseClick={handleCourseClick}></CourseSection>
            </main>
        </div>

    );
}