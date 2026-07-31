import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/logo.svg'
import { useAuthStore } from '../store/authStore'
import { LogoutIcon, ProfileIcon } from './NavIcons'
import ThemeToggle from './ThemeToggle'
import './Header.css'

function Header() {
  const teacher = useAuthStore((state) => state.teacher)
  const logout = useAuthStore((state) => state.logout)
  const location = useLocation()

  return (
    <header className="app-header">
      <img src={logo} className="app-logo" alt="Number Nest" />
      <div className="app-header-account">
        <ThemeToggle />
        {teacher && (
          <>
            <Link to="/profile" className="app-header-profile" aria-label="Profile" title={teacher.name}>
              <ProfileIcon />
            </Link>
            <button type="button" className="app-header-logout" aria-label="Log out" title="Log out" onClick={logout}>
              <LogoutIcon />
            </button>
          </>
        )}
        {!teacher && location.pathname !== '/login' && (
          <Link to="/login" className="app-header-login">
            Teacher login
          </Link>
        )}
      </div>
    </header>
  )
}

export default Header
