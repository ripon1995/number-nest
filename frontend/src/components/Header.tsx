import logo from '../assets/logo.svg'
import { useAuthStore } from '../store/authStore'
import './Header.css'

function Header() {
  const teacher = useAuthStore((state) => state.teacher)
  const logout = useAuthStore((state) => state.logout)

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
