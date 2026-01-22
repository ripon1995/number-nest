import {useState} from 'react';
import {useNavigate, useLocation, useParams} from 'react-router-dom';
import './CourseDetail.css';
import {QuickActionsSection} from "./Course-components/QuickActionSection.tsx";
import {AppPage} from "./Common-component/AppPage.tsx";
import type {Course} from '../types/course';

export default function CourseDetail() {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const course = location.state?.course as Course | undefined;
    const [activeView, setActiveView] = useState<'details' | string>('details');


    const handleMenuAction = (view: string) => {
        setActiveView(view);
    }
    const handleBackButton = () => {
        navigate(-1);
    }

    const renderLeftContent = () => {
        switch (activeView) {
            case 'course-plan':
                return <div><h2>Course Plan</h2>{/* Add Course Plan Component here */}</div>;
            case 'enrolled-students':
                return <div><h2>Enrolled Students</h2>{/* Add Students Table here */}</div>;
            case 'details':
            default:
                return (
                    <>
                        <h1>Course Details</h1>
                        {course ? (
                            <div className="course-info">
                                <p><strong>Title:</strong> {course.title}</p>
                                <p><strong>Description:</strong> {course.description}</p>
                                <p><strong>Batch Days:</strong> {course.batch_days}</p>
                                <p><strong>Batch Time:</strong> {course.batch_time}</p>
                                <p><strong>Capacity:</strong> {course.capacity}</p>
                                <p><strong>Course Fee:</strong> {course.course_fee}</p>
                            </div>
                        ) : (
                            <p>Viewing details for Course ID: {id}</p>
                        )}
                    </>
                );
        }
    };

    return (
        <AppPage
            headerButtonText='Back to Dashboard'
            headerOnAction={handleBackButton}
            headerTitle={course?.title || 'Course Details'}
        >
            <main className='detail-content'>

                <div className="detail-layout">
                    <section className="info-section">
                        {renderLeftContent()}
                    </section>

                    <aside className="sidebar-actions">
                        <QuickActionsSection onSelectView={handleMenuAction}/>
                    </aside>
                </div>
            </main>

        </AppPage>
    );
}