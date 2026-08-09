import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore, useIsAdmin } from '../store/authStore'
import { ApiError } from '../errors/api'
import ErrorDialog from '../components/ErrorDialog'
import ResetPasswordDialog from './profile/ResetPasswordDialog'
import './ProfilePage.css'

function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const isAdmin = useIsAdmin()

  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [resetEmail, setResetEmail] = useState<string | null>(null)

  function openResetDialog() {
    setResetEmail(null)
    setIsResetDialogOpen(true)
  }

  function handleResetSuccess(email: string) {
    setIsResetDialogOpen(false)
    setResetEmail(email)
  }

  return (
    <main id="content" className="profile-page">
      <div className="profile-page-header">
        <h1>Profile</h1>
        <Link to="/dashboard">Back to dashboard</Link>
      </div>

      {user && (
        <div className="profile-detail card">
          <dl className="profile-detail-list">
            <div>
              <dt>Name</dt>
              <dd>{user.name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{user.role === 'admin' ? 'Admin' : 'Student'}</dd>
            </div>
          </dl>
        </div>
      )}

      {isAdmin && (
        <>
          <hr className="profile-divider" />
          <div className="profile-admin-actions">
            <div className="profile-admin-actions-buttons">
              <button type="button" onClick={openResetDialog}>
                Reset a user's password
              </button>
            </div>
            {resetEmail && (
              <p className="reset-password-success">Password reset for {resetEmail}.</p>
            )}
          </div>
        </>
      )}

      {isResetDialogOpen && (
        <ResetPasswordDialog
          onClose={() => setIsResetDialogOpen(false)}
          onError={setError}
          onSuccess={handleResetSuccess}
        />
      )}

      <ErrorDialog error={error} onClose={() => setError(null)} />
    </main>
  )
}

export default ProfilePage
