import {useNavigate} from 'react-router-dom';
import {AppPage} from './Common-component/AppPage';
import {AppRoutes} from '../constants/appRoutes';

export default function Profile() {
    const navigate = useNavigate();

    const handleBackButton = () => {
        navigate(AppRoutes.DASHBOARD);
    };

    return (
        <AppPage
            headerButtonText="Back to Dashboard"
            headerOnAction={handleBackButton}
            headerTitle="Profile"
        >
            <h1>Profile</h1>
        </AppPage>
    );
}