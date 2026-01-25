import {useNavigate} from 'react-router-dom';
import {AppPage} from './Common-component/AppPage';
import {AppRoutes} from '../constants/appRoutes';
import {Typography} from '@mui/material';

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
            <Typography variant="h4" component="h1">
                Profile
            </Typography>
        </AppPage>
    );
}