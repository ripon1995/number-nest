import {useState, useEffect} from 'react';
import type {FormEvent} from 'react';
import {useNavigate} from 'react-router-dom';
import './Auth.css';
import {useUserStore} from '../store/useUserStore';
import {AppPage} from "./Common-component/AppPage.tsx";
import {IoCallOutline, IoLockClosedOutline} from 'react-icons/io5';
import {AppRoutes} from "../constants/appRoutes.ts";
import {TextField, Button, Alert, Box, Typography, Paper, InputAdornment} from '@mui/material';
import {textFieldStyles, primaryButtonStyles} from '../utils/formStyles';

export default function Login() {
    const [formData, setFormData] = useState({
        phone_number: '',
        password: '',
    });

    const {loading, error, success, loginUser, resetState} = useUserStore();
    const navigate = useNavigate();

    useEffect(() => {
        const abortController = new AbortController();

        return () => {
            abortController.abort();
            resetState();
        };
    }, [resetState]);

    useEffect(() => {
        if (success) {
            const {user} = useUserStore.getState();

            // If user is not admin and profile is not created, redirect to profile creation
            if (user && !user.is_admin && user.profile_created === false) {
                navigate(AppRoutes.PROFILE_CREATE);
            } else {
                navigate(AppRoutes.DASHBOARD);
            }
        }
    }, [success, navigate]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const abortController = new AbortController();
        await loginUser(formData, abortController.signal);
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
                <Paper className="registration-card" elevation={3} sx={{padding: 4, borderRadius: 2}}>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Welcome Back
                    </Typography>
                    <Typography variant="body1" className="registration-subtitle" align="center" color="text.secondary" sx={{mb: 3}}>
                        Login to continue learning
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{mb: 2}}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} className="registration-form">
                        <TextField
                            fullWidth
                            type="tel"
                            id="phone_number"
                            name="phone_number"
                            label="Phone Number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            required
                            placeholder="Enter your phone number"
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
                            type="password"
                            id="password"
                            name="password"
                            label="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter your password"
                            disabled={loading}
                            margin="normal"
                            sx={textFieldStyles}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <IoLockClosedOutline />
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
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>

                        <Box className="auth-switch" sx={{textAlign: 'center', mt: 2}}>
                            <Typography variant="body2" component="span">
                                Don't have an account?
                            </Typography>
                            <Button
                                variant="text"
                                onClick={() => navigate(AppRoutes.REGISTER)}
                                disabled={loading}
                                sx={{ml: 1}}
                            >
                                Register here
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </AppPage>
    );
}