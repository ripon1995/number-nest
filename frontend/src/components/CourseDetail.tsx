import {useNavigate, useLocation} from 'react-router-dom';
import {useParams} from 'react-router-dom';
import './CourseDetail.css';
import {QuickActionsSection} from "./Course-components/QuickActionSection.tsx";
import {AppPage} from "./Common-component/AppPage.tsx";
import type {Course} from '../types/course';

export default function CourseDetail() {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const course = location.state?.course as Course | undefined;

    const handleMenuAction = (route: string) => {
        navigate(route);
    }
    const handleBackButton = () => {
        navigate(-1);
    }

    return (
        <AppPage
            headerButtonText='Back to Dashboard'
            headerOnAction={handleBackButton}
            headerTitle={course?.title || 'Course Details'}
        >
            <main>
                <h1>Course Details</h1>
                {course ? (
                    <>
                        <p><strong>Title:</strong> {course.title}</p>
                        <p><strong>Description:</strong> {course.description}</p>
                        <p><strong>Batch Days:</strong> {course.batch_days}</p>
                        <p><strong>Batch Time:</strong> {course.batch_time}</p>
                        <p><strong>Capacity:</strong> {course.capacity}</p>
                        <p><strong>Course Fee:</strong> {course.course_fee}</p>
                    </>
                ) : (
                    <p>Viewing details for Course ID: {id}</p>
                )}
                <QuickActionsSection onNavigate={handleMenuAction}></QuickActionsSection>
            </main>

        </AppPage>
    );
}