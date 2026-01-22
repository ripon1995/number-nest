import {useNavigate} from 'react-router-dom';
import {useParams} from 'react-router-dom'
import {QuickActionsSection} from "./Course-components/QuickActionSection.tsx";
import {DashboardHeader} from "./Dashboard-components/DashboardHeader.tsx";
import {AppRoutes} from "../constants/appRoutes.ts";

export default function CourseDetail() {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const handleMenuAction = (route: string) => {
        navigate(route);
    }
    const handleLogout = () => {
        navigate(AppRoutes.LOGIN);
    }

    return (
        <div className="dashboard">
            <DashboardHeader onLogout={handleLogout}></DashboardHeader>
            <h1>Course Details</h1>
            <p>Viewing details for Course ID: {id}</p>
            <QuickActionsSection onNavigate={handleMenuAction}></QuickActionsSection>
        </div>
    );
}