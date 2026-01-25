import {useState, useEffect} from 'react';
import type {FormEvent} from 'react';
import {useNavigate} from 'react-router-dom';
import './Auth.css';
import {useUserStore} from '../store/useUserStore';
import {AppPage} from "./Common-component/AppPage.tsx";
import {IoPersonOutline, IoCallOutline, IoSchoolOutline, IoMailOutline} from 'react-icons/io5';
import {AppRoutes} from "../constants/appRoutes.ts";
import {TextField, Button, Alert, Box, Typography, Paper, InputAdornment} from '@mui/material';
import {textFieldStyles, primaryButtonStyles} from '../utils/formStyles';

export default function ProfileCreation() {
    const [formData, setFormData] = useState({
        father_name: '',
        father_contact: '',
        college: '',
        email: '',
    });

    const {loading, error, createStudentProfile, resetState, user} = useUserStore();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect if user is admin or already has profile
        if (user?.is_admin) {
            navigate(AppRoutes.DASHBOARD);
        }

        return () => {
            resetState();
        };
    }, [user, navigate, resetState]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const abortController = new AbortController();
        const success = await createStudentProfile(formData, abortController.signal);

        if (success) {
            // Update user's profile_created flag in localStorage
            const currentUser = useUserStore.getState().user;
            if (currentUser) {
                const updatedUser = {...currentUser, profile_created: true};
                localStorage.setItem('user', JSON.stringify(updatedUser));
                useUserStore.setState({user: updatedUser});
            }

            setTimeout(() => {
                navigate(AppRoutes.DASHBOARD);
            }, 1500);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <AppPage className="auth-page">
            <Box className="registration-container">
                <Paper className="registration-card" elevation={3} sx={{padding: 4, borderRadius: 2, maxWidth: 600, margin: '0 auto'}}>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Complete Your Profile
                    </Typography>
                    <Typography variant="body1" className="registration-subtitle" align="center" color="text.secondary" sx={{mb: 3}}>
                        Please provide additional information to continue
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{mb: 2}}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} className="registration-form">
                        <TextField
                            fullWidth
                            type="text"
                            id="father_name"
                            name="father_name"
                            label="Father's Name"
                            value={formData.father_name}
                            onChange={handleChange}
                            required
                            placeholder="Enter father's name"
                            disabled={loading}
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

                        <TextField
                            fullWidth
                            type="tel"
                            id="father_contact"
                            name="father_contact"
                            label="Father's Contact"
                            value={formData.father_contact}
                            onChange={handleChange}
                            required
                            placeholder="Enter father's contact number"
                            disabled={loading}
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

                        <TextField
                            fullWidth
                            type="text"
                            id="college"
                            name="college"
                            label="College"
                            value={formData.college}
                            onChange={handleChange}
                            required
                            placeholder="Enter your college name"
                            disabled={loading}
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

                        <TextField
                            fullWidth
                            type="email"
                            id="email"
                            name="email"
                            label="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter your email address"
                            disabled={loading}
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

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loading}
                            sx={{...primaryButtonStyles, mt: 3, mb: 2}}
                        >
                            {loading ? 'Creating Profile...' : 'Complete Profile'}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </AppPage>
    );
}
