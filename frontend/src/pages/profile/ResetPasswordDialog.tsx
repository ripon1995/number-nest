import { useState, type FormEvent } from 'react'
import Modal from '../../components/Modal'
import * as api from '../../api'
import { ApiError } from '../../errors/api'

interface ResetPasswordDialogProps {
  onClose: () => void
  onError: (err: ApiError) => void
  onSuccess: (email: string) => void
}

function ResetPasswordDialog({ onClose, onError, onSuccess }: ResetPasswordDialogProps) {
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    setIsSubmitting(true)
    try {
      await api.resetPassword({ email, new_password: newPassword })
      onSuccess(email)
    } catch (err) {
      onError(
        err instanceof ApiError
          ? err
          : new ApiError(0, 'Something went wrong', 'Something went wrong'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal labelledBy="reset-password-dialog-title" onClose={onClose} isSubmitting={isSubmitting}>
      <form className="reset-password-form" onSubmit={handleSubmit}>
        <h2 id="reset-password-dialog-title">Reset a user's password</h2>
        <p className="profile-section-hint">
          Sets a new password for any admin or student account by email, and signs it out of
          every active session.
        </p>
        <label>
          Account email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
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
        <div className="reset-password-form-actions">
          <button type="button" className="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting}>
            Reset password
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ResetPasswordDialog
