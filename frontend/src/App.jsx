import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth'
import Layout from './components/Layout'
import Login from './pages/Login'
import AdminLogin from './pages/AdminLogin'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import Biens from './pages/Biens'
import Demandes from './pages/Demandes'
import Validation from './pages/Validation'
import Affectations from './pages/Affectations'

function Protected({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function Reserve({ roles, children }) {
  const { user } = useAuth()
  return roles.includes(user?.role) ? children : <Navigate to="/tableau-de-bord" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<Protected><Layout /></Protected>}>
            <Route path="/tableau-de-bord" element={<Dashboard />} />
            <Route path="/biens" element={<Biens />} />
          <Route path="/affectations" element={<Reserve roles={['admin', 'gestionnaire']}><Affectations /></Reserve>} />
            <Route path="/mes-demandes" element={<Reserve roles={['agent']}><Demandes /></Reserve>} />
            <Route path="/validation" element={<Reserve roles={['admin']}><Validation /></Reserve>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}