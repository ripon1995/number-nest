import { Link } from 'react-router-dom'
import logo from '../assets/logo.svg'
import { useAuthStore } from '../store/authStore'
import { LogoutIcon, ProfileIcon } from './NavIcons'
import './Header.css'

function Header() {
  const teacher = useAuthStore((state) => state.teacher)
  const logout = useAuthStore((state) => state.logout)

  return (
    <header className="app-header">
      <img src={logo} className="app-logo" alt="Number Nest" />
      {teacher && (
        <div className="app-header-account">
          <Link to="/profile" className="app-header-profile" aria-label="Profile" title={teacher.name}>
            <ProfileIcon />
          </Link>
          <button type="button" className="app-header-logout" aria-label="Log out" title="Log out" onClick={logout}>
            <LogoutIcon />
          </button>
        </div>
      )}
    </header>
  )
}

export default Header
