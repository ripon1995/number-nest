import { NavLink } from 'react-router-dom'
import {
  AttendanceIcon,
  CoursesIcon,
  DashboardIcon,
  EnrollmentsIcon,
  PaymentsIcon,
  StudentsIcon,
} from './NavIcons'
import './NavMenu.css'

const links = [
  { to: '/', label: 'Dashboard', end: true, Icon: DashboardIcon },
  { to: '/students', label: 'Students', Icon: StudentsIcon },
  { to: '/courses', label: 'Courses', Icon: CoursesIcon },
  { to: '/enrollments', label: 'Enrollments', Icon: EnrollmentsIcon },
  { to: '/payments', label: 'Payments', Icon: PaymentsIcon },
  { to: '/attendance', label: 'Attendance', Icon: AttendanceIcon },
]

function NavMenu() {
  return (
    <nav className="app-nav">
      <ul>
        {links.map(({ to, label, end, Icon }) => (
          <li key={to}>
            <NavLink to={to} end={end}>
              <span className="app-nav-icon">
                <Icon />
              </span>
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default NavMenu
