import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import Logo from '../components/Logo'

const ROLES_ADMIN = ['admin']

const Cadenas = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
)

export default function AdminLogin() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/tableau-de-bord" replace />

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password, ROLES_ADMIN)
      navigate('/tableau-de-bord')
    } catch (err) {
      setError(err.roleRefuse ? 'Accès réservé aux administrateurs.' : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-page">
      <form className="admin-card" onSubmit={submit}>
        <div className="admin-head">
          <Logo size={48} />
          <span className="admin-lock"><Cadenas /></span>
        </div>
        <h1>Espace administrateur</h1>
        <p className="admin-sub">Accès réservé au personnel autorisé</p>

        {error && <div className="alert">{error}</div>}

        <label>Identifiant (e-mail)</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />

        <label>Mot de passe</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />

        <button type="submit" disabled={loading}>
          {loading ? 'Vérification...' : 'Accéder à l’administration'}
        </button>

        <Link className="admin-retour" to="/login">Espace utilisateur</Link>
        <Link className="admin-retour" to="/">Retour à l'accueil</Link>
      </form>
    </div>
  )
}