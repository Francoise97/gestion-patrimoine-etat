import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth'

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">🏛️ PATRIMOINE</div>

        <nav className="menu">
          <NavLink to="/" end>📊 Tableau de bord</NavLink>
          <NavLink to="/biens">📦 Inventaire</NavLink>
        </nav>

        <div className="sidebar-bottom">
          <div className="who">
            <span>{user.name}</span>
            <span className="badge">{user.role}</span>
          </div>
          <button className="logout" onClick={logout}>🚪 Déconnexion</button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}