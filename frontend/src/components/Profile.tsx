import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useUserStore} from '../store/useUserStore';
import {AppPage} from './Common-component/AppPage';
import {IoPersonOutline, IoCallOutline, IoSchoolOutline, IoMailOutline} from 'react-icons/io5';
import {TextField, Alert, Box, Typography, Paper, InputAdornment, CircularProgress, Button, Grid, Chip} from '@mui/material';
import {textFieldStyles, primaryButtonStyles} from '../utils/formStyles';
import {AppRoutes} from '../constants/appRoutes';

export default function Profile() {
    const {studentProfile, loading, error, fetchStudentProfile, updateStudentProfile, logout, user} = useUserStore();
    const navigate = useNavigate();
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        father_name: '',
        father_contact: '',
        college: '',
        email: '',
    });

    useEffect(() => {
        const abortController = new AbortController();

        // Fetch profile using user's id
        if (user?.id) {
            fetchStudentProfile(user.id, abortController.signal).catch(() => {
                // Error is handled in the store
            });
        }

        return () => {
            abortController.abort();
        };
    }, [fetchStudentProfile, user?.id]);

    useEffect(() => {
        if (studentProfile) {
            setFormData({
                father_name: studentProfile.father_name,
                father_contact: studentProfile.father_contact,
                college: studentProfile.college,
                email: studentProfile.email,
            });
        }
    }, [studentProfile]);

    const handleBackToDashboard = () => {
        navigate(AppRoutes.DASHBOARD);
    };

    const handleLogout = () => {
        logout();
        navigate(AppRoutes.LOGIN);
    };

    const handleEdit = () => {
        setEditMode(true);
    };

    const handleCancel = () => {
        setEditMode(false);
        if (studentProfile) {
            setFormData({
                father_name: studentProfile.father_name,
                father_contact: studentProfile.father_contact,
                college: studentProfile.college,
                email: studentProfile.email,
            });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        if (studentProfile?.id) {
            const success = await updateStudentProfile(studentProfile.id, formData);
            if (success) {
                setEditMode(false);
                alert('Profile updated successfully!');
            }
        }
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
                                    value={studentProfile?.user?.name || user?.name || ''}
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
                                    value={studentProfile?.user?.phone_number || user?.phone_number || ''}
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
                                    value={formData.father_name}
                                    onChange={handleChange}
                                    disabled={!editMode}
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
                                    value={formData.father_contact}
                                    onChange={handleChange}
                                    disabled={!editMode}
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
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={!editMode}
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
                                    value={formData.college}
                                    onChange={handleChange}
                                    disabled={!editMode}
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

                            {studentProfile?.course && (
                                <Grid item xs={12}>
                                    <Box sx={{mt: 2}}>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Enrolled Course
                                        </Typography>
                                        <Chip
                                            label={studentProfile.course.title}
                                            color="primary"
                                            sx={{fontSize: '1rem', py: 2.5}}
                                        />
                                    </Box>
                                </Grid>
                            )}

                        </Grid>

                        {!editMode ? (
                            <>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={handleEdit}
                                    sx={{...primaryButtonStyles, mt: 4, mb: 2}}
                                >
                                    Edit Profile
                                </Button>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={handleLogout}
                                >
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <Grid container spacing={2} sx={{mt: 2}}>
                                <Grid item xs={12} sm={6}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </Button>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        onClick={handleSave}
                                        sx={primaryButtonStyles}
                                    >
                                        Save Changes
                                    </Button>
                                </Grid>
                            </Grid>
                        )}
                    </Box>
                </Paper>
            </Box>
        </AppPage>
    );
}