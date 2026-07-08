import logo from '../assets/logo.svg'
import { useAuth } from '../context/AuthContext'
import './Header.css'

function Header() {
  const { teacher, logout } = useAuth()

  return (
    <header className="app-header">
      <img src={logo} className="app-logo" alt="Number Nest" />
      {teacher && (
        <div className="app-header-account">
          <span>{teacher.name}</span>
          <button type="button" onClick={logout}>
            Log out
          </button>
        </div>
      )}
    </header>
  )
}

export default Header
