import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {useUserStore} from '../store/useUserStore';
import {AppPage} from './Common-component/AppPage';
import {IoPersonOutline, IoCallOutline, IoSchoolOutline, IoMailOutline} from 'react-icons/io5';
import {TextField, Alert, Box, Typography, Paper, InputAdornment, CircularProgress, Button, Grid} from '@mui/material';
import {textFieldStyles, primaryButtonStyles} from '../utils/formStyles';
import {AppRoutes} from '../constants/appRoutes';

export default function Profile() {
    const {profile, loading, error, fetchUserProfile, logout} = useUserStore();
    const navigate = useNavigate();

    useEffect(() => {
        const abortController = new AbortController();

        fetchUserProfile(abortController.signal).catch(() => {
            // Error is handled in the store
        });

        return () => {
            abortController.abort();
        };
    }, [fetchUserProfile]);

    const handleBackToDashboard = () => {
        navigate(AppRoutes.DASHBOARD);
    };

    const handleLogout = () => {
        logout();
        navigate(AppRoutes.LOGIN);
    };

    if (loading) {
        return (
            <AppPage
                headerTitle="Profile"
                headerButtonText="Back to Dashboard"
                headerOnAction={handleBackToDashboard}
            >
                <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh'}}>
                    <CircularProgress />
                </Box>
            </AppPage>
        );
    }

    return (
        <AppPage
            headerTitle="Profile"
            headerButtonText="Back to Dashboard"
            headerOnAction={handleBackToDashboard}
        >
            <Box className="registration-container">
                <Paper className="registration-card" elevation={3} sx={{padding: 4, borderRadius: 2, maxWidth: 800, margin: '0 auto'}}>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Profile Information
                    </Typography>
                    <Typography variant="body1" className="registration-subtitle" align="center" color="text.secondary" sx={{mb: 3}}>
                        View your account details
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{mb: 2}}>
                            {error}
                        </Alert>
                    )}

                    <Box sx={{mt: 3}}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    id="name"
                                    name="name"
                                    label="Name"
                                    value={profile?.name || ''}
                                    disabled
                                    margin="normal"
                                    sx={textFieldStyles}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IoPersonOutline />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    id="phone_number"
                                    name="phone_number"
                                    label="Phone Number"
                                    value={profile?.phone_number || ''}
                                    disabled
                                    margin="normal"
                                    sx={textFieldStyles}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IoCallOutline />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    id="father_name"
                                    name="father_name"
                                    label="Father's Name"
                                    value={profile?.father_name || 'Not provided'}
                                    disabled
                                    margin="normal"
                                    sx={textFieldStyles}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IoPersonOutline />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    id="father_contact"
                                    name="father_contact"
                                    label="Father's Contact"
                                    value={profile?.father_contact || 'Not provided'}
                                    disabled
                                    margin="normal"
                                    sx={textFieldStyles}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IoCallOutline />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    id="email"
                                    name="email"
                                    label="Email"
                                    value={profile?.email || 'Not provided'}
                                    disabled
                                    margin="normal"
                                    sx={textFieldStyles}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IoMailOutline />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    id="college"
                                    name="college"
                                    label="College"
                                    value={profile?.college || 'Not provided'}
                                    disabled
                                    margin="normal"
                                    sx={textFieldStyles}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IoSchoolOutline />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Grid>

                        </Grid>

                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleLogout}
                            sx={{...primaryButtonStyles, mt: 4}}
                        >
                            Logout
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </AppPage>
    );
}