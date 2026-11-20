import { Outlet } from 'react-router-dom'
import { useAuth } from '../auth'

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div>
      <header className="topbar">
        <strong>Patrimoine de l'État</strong>
        <div className="topbar-right">
          <span>{user.name}</span>
          <span className="badge">{user.role}</span>
          <button className="secondary" onClick={logout}>Déconnexion</button>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </div>
  )
}