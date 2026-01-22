import {useNavigate} from 'react-router-dom';
import {useParams} from 'react-router-dom';
import './CourseDetail.css';
import {QuickActionsSection} from "./Course-components/QuickActionSection.tsx";
import {AppHeader} from "./Common-component/AppHeader.tsx";

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
            <AppHeader
                buttonText='Back to Dashboard'
                onAction={handleBackButton}
            ></AppHeader>
            <main>
                <h1>Course Details</h1>
                <p>Viewing details for Course ID: {id}</p>
                <QuickActionsSection onNavigate={handleMenuAction}></QuickActionsSection>
            </main>

        </div>
    );
}