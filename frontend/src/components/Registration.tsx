import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './Registration.css';
import { useUserStore } from '../store/useUserStore';
import Logo from './Logo';
import { IoPersonOutline, IoCallOutline, IoLockClosedOutline } from 'react-icons/io5';

export default function Registration() {
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    password: '',
  });

  const { loading, error, success, registerUser, resetState } = useUserStore();
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
      const timer = setTimeout(() => {
        navigate('/');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const abortController = new AbortController();
    await registerUser(formData, abortController.signal);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="registration">
      <div className="page-header">
        <Logo />
      </div>

      <div className="registration-container">
        <div className="registration-card">
          <h1>Create Account</h1>
          <p className="registration-subtitle">Join Number Nest to start learning</p>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              Registration successful! Redirecting to dashboard...
            </div>
          )}

          <form onSubmit={handleSubmit} className="registration-form">
            <div className="form-group">
              <label htmlFor="name">
                <IoPersonOutline className="input-icon" />
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone_number">
                <IoCallOutline className="input-icon" />
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
                <IoLockClosedOutline className="input-icon" />
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a password"
                disabled={loading}
              />
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Creating Account...' : 'Register'}
            </button>

            <button
              type="button"
              className="back-button"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Back to Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}