import { useAuth } from '../context/AuthContext'

function DashboardPage() {
  const { teacher } = useAuth()

  return (
    <main id="content">
      <h1>Number Nest</h1>
      <p>Welcome back, {teacher?.name}.</p>
      <p>Course and student management dashboard.</p>
    </main>
  )
}

export default DashboardPage
