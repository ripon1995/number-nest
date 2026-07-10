import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import './ProfilePage.css'

function ProfilePage() {
  const teacher = useAuthStore((state) => state.teacher)

  return (
    <main id="content" className="profile-page">
      <div className="profile-page-header">
        <h1>Profile</h1>
        <Link to="/">Back to dashboard</Link>
      </div>

      {teacher && (
        <div className="profile-detail card">
          <dl className="profile-detail-list">
            <div>
              <dt>Name</dt>
              <dd>{teacher.name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{teacher.email}</dd>
            </div>
          </dl>
        </div>
      )}
    </main>
  )
}

export default ProfilePage
