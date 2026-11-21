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