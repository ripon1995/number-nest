import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { ApiError } from '../errors/api'
import ErrorDialog from '../components/ErrorDialog'
import './AuthForm.css'

function RegisterPage() {
  const teacher = useAuthStore((state) => state.teacher)
  const isLoading = useAuthStore((state) => state.isLoading)
  const register = useAuthStore((state) => state.register)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<ApiError | null>(null)
  const [accountExists, setAccountExists] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isLoading && teacher) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setAccountExists(false)
    setIsSubmitting(true)
    try {
      await register({ email, name, password })
      navigate('/')
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setAccountExists(true)
      } else {
        setError(
          err instanceof ApiError
            ? err
            : new ApiError(0, 'Something went wrong', 'Something went wrong'),
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main id="content">
      <h1>Register</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </label>
        {accountExists && (
          <p className="error">
            A teacher account already exists. <Link to="/login">Log in instead</Link>.
          </p>
        )}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Registering…' : 'Register'}
        </button>
        <p className="hint">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
      <ErrorDialog error={error} onClose={() => setError(null)} />
    </main>
  )
}

export default RegisterPage
