import { useState, type FormEvent } from 'react'
import * as api from '../../api'
import { ApiError } from '../../errors/api'
import ErrorDialog from '../../components/ErrorDialog'

function toApiError(err: unknown): ApiError {
  return err instanceof ApiError ? err : new ApiError(0, 'Something went wrong', 'Something went wrong')
}

function ResetPasswordForm() {
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [resetEmail, setResetEmail] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setResetEmail(null)
    try {
      await api.resetPassword({ email, new_password: newPassword })
      setResetEmail(email)
      setEmail('')
      setNewPassword('')
    } catch (err) {
      setError(toApiError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="profile-detail card">
      <h2 className="profile-section-title">Reset a user's password</h2>
      <p className="profile-section-hint">
        Sets a new password for any admin or student account by email, and signs it out of every
        active session.
      </p>
      <form className="reset-password-form" onSubmit={handleSubmit}>
        <label>
          Account email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          New password
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Resetting…' : 'Reset password'}
        </button>
        {resetEmail && (
          <p className="reset-password-success">Password reset for {resetEmail}.</p>
        )}
      </form>

      <ErrorDialog error={error} onClose={() => setError(null)} />
    </div>
  )
}

export default ResetPasswordForm
