import { useAuthStore } from '../store/authStore'

function DashboardPage() {
  const teacher = useAuthStore((state) => state.teacher)

  return (
    <main id="content">
      <h1>Number Nest</h1>
      <p>Welcome back, {teacher?.name}.</p>
      <p>Course and student management dashboard.</p>
    </main>
  )
}

export default DashboardPage
