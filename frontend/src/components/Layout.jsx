import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth'
import { api } from '../api'
import Logo from './Logo'
import { IconDashboard, IconBox, IconWrench, IconLogout } from './Icons'

const svg = {
  width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
}
const IconTransfer = () => (
  <svg {...svg}><path d="M7 7h13M16 3l4 4-4 4M17 17H4M8 13l-4 4 4 4" /></svg>
)
const IconPlus = () => (
  <svg {...svg}><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></svg>
)
const IconCheck = () => (
  <svg {...svg}>
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 14l2 2 4-4" />
  </svg>
)

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [enAttente, setEnAttente] = useState(0)

  const estAdmin = user.role === 'admin'
  const gereAffectations = ['admin', 'gestionnaire'].includes(user.role)
  const peutProposer = user.role === 'agent'

  useEffect(() => {
    if (!estAdmin) return undefined
    const charger = () => {
      api('/demandes/compte').then((d) => setEnAttente(d.en_attente)).catch(() => {})
    }
    charger()
    window.addEventListener('demandes-changees', charger)
    return () => window.removeEventListener('demandes-changees', charger)
  }, [estAdmin, location.pathname])

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <Logo size={38} />
          <div className="brand-text">
            <strong>PATRIMOINE TOGO</strong>
            <small>République togolaise</small>
          </div>
        </div>

        <nav className="menu">
          <NavLink to="/tableau-de-bord"><IconDashboard /> Tableau de bord</NavLink>
          <NavLink to="/biens"><IconBox /> Inventaire</NavLink>
          {gereAffectations && <NavLink to="/affectations"><IconTransfer /> Affectations</NavLink>}
          <NavLink to="/pannes"><IconWrench /> Pannes</NavLink>
          {peutProposer && <NavLink to="/mes-demandes"><IconPlus /> Proposer un bien</NavLink>}
          {estAdmin && (
            <NavLink to="/validation">
              <IconCheck /> Validation
              {enAttente > 0 && <span className="pastille">{enAttente}</span>}
            </NavLink>
          )}
        </nav>

        <div className="sidebar-bottom">
          <div className="who">
            <span>{user.name}</span>
            <span className="badge">{user.role}</span>
          </div>
          <button className="logout" onClick={logout}><IconLogout /> Déconnexion</button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}