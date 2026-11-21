import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import Logo from '../components/Logo'

const ROLES_CLIENT = ['agent', 'gestionnaire', 'auditeur']

export default function Login() {
  const { user, login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('connexion')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/tableau-de-bord" replace />

  const changerMode = (m) => {
    setMode(m)
    setError('')
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'connexion') await login(email, password, ROLES_CLIENT)
      else await register(name, email, password)
      navigate('/tableau-de-bord')
    } catch (err) {
      if (err.roleRefuse === 'admin') {
        setError("Ce compte est un compte administrateur : utilisez l'espace administrateur.")
      } else {
        const details = err.errors ? ' ' + Object.values(err.errors).flat().join(' ') : ''
        setError(err.message + details)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <form className="card login-card" onSubmit={submit}>
        <div className="login-logo"><Logo size={64} /></div>
        <h1>Espace utilisateur</h1>
        <p className="muted">Agents, gestionnaires et auditeurs</p>

        <div className="tabs">
          <button type="button" className={mode === 'connexion' ? 'actif' : ''} onClick={() => changerMode('connexion')}>Connexion</button>
          <button type="button" className={mode === 'inscription' ? 'actif' : ''} onClick={() => changerMode('inscription')}>Créer un compte</button>
        </div>

        {error && <div className="alert">{error}</div>}

        {mode === 'inscription' && (
          <>
            <label>Nom complet</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </>
        )}

        <label>Adresse e-mail</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Mot de passe{mode === 'inscription' ? ' (8 caractères minimum)' : ''}</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={mode === 'inscription' ? 8 : undefined} required />

        <button type="submit" disabled={loading}>
          {loading ? 'Veuillez patienter...' : mode === 'connexion' ? 'Se connecter' : 'Créer mon compte'}
        </button>

        <Link className="retour" to="/">Retour à l'accueil</Link>
        <Link className="retour" to="/admin/login">Espace administrateur</Link>
        <p className="muted disclaimer">Projet pédagogique : données de démonstration, site non officiel.</p>
      </form>
    </div>
  )
}