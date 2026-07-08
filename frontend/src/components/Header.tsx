import logo from '../assets/logo.svg'
import './Header.css'

function Header() {
  return (
    <header className="app-header">
      <img src={logo} className="app-logo" alt="Number Nest" />
    </header>
  )
}

export default Header
