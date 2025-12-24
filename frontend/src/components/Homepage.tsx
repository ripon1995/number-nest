import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import Logo from './Logo';
import './Homepage.css';

export default function Homepage() {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="homepage">
      <div className="page-header">
        <Logo />
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="homepage-content">
        <div className="welcome-card">
          <h1>Welcome to NumberNest</h1>
          {user && (
            <p className="user-greeting">Hello, {user.name}!</p>
          )}
        </div>
      </div>
    </div>
  );
}