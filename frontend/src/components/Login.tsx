import {useState, useEffect} from 'react';
import type {FormEvent} from 'react';
import {useNavigate} from 'react-router-dom';
import './Auth.css';
import {useUserStore} from '../store/useUserStore';
import {AppPage} from "./Common-component/AppPage.tsx";
import {IoCallOutline, IoLockClosedOutline} from 'react-icons/io5';
import {AppRoutes} from "../constants/appRoutes.ts";

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
            navigate(AppRoutes.DASHBOARD);
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
            <div className="registration-container">
                <div className="registration-card">
                    <h1>Welcome Back</h1>
                    <p className="registration-subtitle">Login to continue learning</p>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="registration-form">
                        <div className="form-group">
                            <label htmlFor="phone_number">
                                <IoCallOutline className="input-icon"/>
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                id="phone_number"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                required
                                placeholder="Enter your phone number"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">
                                <IoLockClosedOutline className="input-icon"/>
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Enter your password"
                                disabled={loading}
                            />
                        </div>

                        <button type="submit" className="submit-button" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>

                        <div className="auth-switch">
                            <p>Don't have an account?</p>
                            <button
                                type="button"
                                className="link-button"
                                onClick={() => navigate(AppRoutes.REGISTER)}
                                disabled={loading}
                            >
                                Register here
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppPage>
    );
}