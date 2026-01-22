import {useNavigate} from 'react-router-dom';
import {useParams} from 'react-router-dom';
import './CourseDetail.css';
import {QuickActionsSection} from "./Course-components/QuickActionSection.tsx";
import {DashboardHeader} from "./Dashboard-components/DashboardHeader.tsx";

export default function CourseDetail() {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const handleMenuAction = (route: string) => {
        navigate(route);
    }
    const handleBackButton = () => {
        navigate(-1);
    }

    return (
        <div className="dashboard">
            <DashboardHeader
                buttonText='Back to Dashboard'
                onAction={handleBackButton}
            ></DashboardHeader>
            <main>
                <h1>Course Details</h1>
                <p>Viewing details for Course ID: {id}</p>
                <QuickActionsSection onNavigate={handleMenuAction}></QuickActionsSection>
            </main>

        </div>
    );
}