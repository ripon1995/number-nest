import {useNavigate, useLocation, useParams, Outlet} from 'react-router-dom';
import './CourseDetail.css';
import {QuickActionsSection} from "./Course-components/QuickActionSection.tsx";
import {AppPage} from "./Common-component/AppPage.tsx";
import type {Course} from '../types/course';
import {Container, Box} from '@mui/material';

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
            <Container maxWidth="xl" className='detail-content' sx={{mt: 3}}>
                <Box className="detail-layout" sx={{display: 'flex', gap: 2, alignItems: 'flex-start', justifyContent: 'space-between'}}>
                    <Box className="info-section" sx={{flex: 1, minWidth: 0, maxWidth: 'calc(100% - 300px)'}}>
                        <Outlet context={{course}}/>
                    </Box>

                    <Box className="sidebar-actions" sx={{width: '280px', flexShrink: 0}}>
                        <QuickActionsSection
                           onNavigate={(path) => navigate(path)}
                           courseId={id}
                        />
                    </Box>
                </Box>
            </Container>

        </AppPage>
    );
}