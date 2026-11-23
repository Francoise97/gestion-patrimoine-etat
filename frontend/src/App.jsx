import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth'
import Layout from './components/Layout'
import Login from './pages/Login'

import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import Biens from './pages/Biens'
import Demandes from './pages/Demandes'
import Validation from './pages/Validation'
import Administration from './pages/Administration'
import Clients from './pages/Clients'
import Pannes from './pages/Pannes'
import Affectations from './pages/Affectations'

function Protected({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function Reserve({ roles, children }) {
  const { user } = useAuth()
  return roles.includes(user?.role) ? children : <Navigate to={user?.role === 'agent' ? '/mes-demandes' : '/tableau-de-bord'} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          <Route element={<Protected><Layout /></Protected>}>
            <Route path="/tableau-de-bord" element={<Reserve roles={['admin', 'gestionnaire', 'auditeur']}><Dashboard /></Reserve>} />
            <Route path="/biens" element={<Reserve roles={['admin', 'gestionnaire', 'auditeur']}><Biens /></Reserve>} />
          <Route path="/affectations" element={<Reserve roles={['admin', 'gestionnaire']}><Affectations /></Reserve>} />
            <Route path="/mes-demandes" element={<Reserve roles={['agent']}><Demandes /></Reserve>} />
            <Route path="/pannes" element={<Pannes />} />
            <Route path="/validation" element={<Reserve roles={['admin']}><Validation /></Reserve>} />
            <Route path="/administration" element={<Reserve roles={['admin']}><Administration /></Reserve>} />
            <Route path="/clients" element={<Reserve roles={['admin']}><Clients /></Reserve>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
