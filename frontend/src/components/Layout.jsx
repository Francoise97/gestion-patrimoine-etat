import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth'
import Logo from './Logo'
import { IconDashboard, IconBox, IconLogout } from './Icons'

export default function Layout() {
  const { user, logout } = useAuth()

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
          <NavLink to="/" end><IconDashboard /> Tableau de bord</NavLink>
          <NavLink to="/biens"><IconBox /> Inventaire</NavLink>
          <NavLink to="/affectations"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h13M16 3l4 4-4 4M17 17H4M8 13l-4 4 4 4"/></svg> Affectations</NavLink>
        </nav>

        <div className="sidebar-bottom">
          <button className="logout" onClick={logout}><IconLogout /> Déconnexion</button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}