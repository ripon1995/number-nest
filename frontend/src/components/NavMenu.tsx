import { NavLink } from 'react-router-dom'
import './NavMenu.css'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/students', label: 'Students' },
  { to: '/courses', label: 'Courses' },
  { to: '/enrollments', label: 'Enrollments' },
  { to: '/payments', label: 'Payments' },
  { to: '/attendance', label: 'Attendance' },
]

function NavMenu() {
  return (
    <nav className="app-nav">
      <ul>
        {links.map(({ to, label, end }) => (
          <li key={to}>
            <NavLink to={to} end={end}>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default NavMenu
