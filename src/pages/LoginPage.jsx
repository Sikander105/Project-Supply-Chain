import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../store/authStore'

export default function LoginPage() {
  const { isAuthenticated, login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'register') {
        await register(name.trim(), email.trim(), password)
      } else {
        await login(email.trim(), password)
      }
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="auth-page">
      <article className="auth-card">
        <h1>{mode === 'login' ? 'Sign in' : 'Create account'}</h1>
        <form onSubmit={onSubmit} className="auth-form">
          {mode === 'register' ? (
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          ) : null}
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          {error ? <p className="form-field__error">{error}</p> : null}
          <button className="button" type="submit" disabled={busy}>
            {busy ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <button className="button button--ghost" type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Need an account? Register' : 'Have an account? Sign in'}
        </button>
      </article>
    </section>
  )
}