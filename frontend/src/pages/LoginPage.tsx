import {useState, type FormEvent} from 'react'
import {Navigate, useNavigate} from 'react-router-dom'
import {useAuthStore} from '../store/authStore'
import {ApiError} from '../errors/api'
import ErrorDialog from '../components/ErrorDialog'
import './AuthForm.css'

function LoginPage() {
    const teacher = useAuthStore((state) => state.teacher)
    const isLoading = useAuthStore((state) => state.isLoading)
    const login = useAuthStore((state) => state.login)
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<ApiError | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!isLoading && teacher) {
        return <Navigate to="/" replace/>
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault()
        setError(null)
        setIsSubmitting(true)
        try {
            await login({email, password})
            navigate('/')
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? err
                    : new ApiError(0, 'Something went wrong', 'Something went wrong'),
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main id="content">
            <h1>Log in</h1>
            <form className="auth-form" onSubmit={handleSubmit}>
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
                        autoComplete="current-password"
                    />
                </label>
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Logging in…' : 'Log in'}
                </button>
                {/*TODO: Will be added later*/}
                {/*<p className="hint">*/}
                {/*  No account yet? <Link to="/register">Register</Link>*/}
                {/*</p>*/}
            </form>
            <ErrorDialog error={error} onClose={() => setError(null)}/>
        </main>
    )
}

export default LoginPage
