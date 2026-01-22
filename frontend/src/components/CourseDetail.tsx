import {useNavigate, useLocation, useParams, Outlet} from 'react-router-dom';
import './CourseDetail.css';
import {QuickActionsSection} from "./Course-components/QuickActionSection.tsx";
import {AppPage} from "./Common-component/AppPage.tsx";
import type {Course} from '../types/course';

export default function CourseDetail() {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const course = location.state?.course as Course | undefined;


    const handleBackButton = () => {
        navigate(-1);
    }

    return (
        <AppPage
            headerButtonText='Back to Dashboard'
            headerOnAction={handleBackButton}
            headerTitle={course?.title || 'Course Details'}
        >
            <main className='detail-content'>

                <div className="detail-layout">
                    <section className="info-section">
                        <Outlet context={{course}}/>
                    </section>

                    <aside className="sidebar-actions">
                        <QuickActionsSection
                           onNavigate={(path) => navigate(path)}
                           courseId={id}
                        />
                    </aside>
                </div>
            </main>

        </AppPage>
    );
}