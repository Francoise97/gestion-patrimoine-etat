import { createContext, useContext, useState } from 'react'
import { api, setSession, clearSession, getUser } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getUser())

  // roles : rôles autorisés sur la page de connexion utilisée (facultatif)
  const login = async (email, password, roles) => {
    const data = await api('/auth/login', { method: 'POST', body: { email, password } })

    if (roles && !roles.includes(data.user.role)) {
      // On annule le jeton qui vient d'être créé, sans ouvrir de session
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Accept: 'application/json', Authorization: `Bearer ${data.token}` },
      }).catch(() => {})
      const err = new Error("Ce compte n'a pas accès à cet espace.")
      err.roleRefuse = data.user.role
      throw err
    }

    setSession(data.token, data.user)
    setUser(data.user)
  }

  // Création de compte : le serveur attribue toujours le rôle "agent"
  const register = async (name, email, password) => {
    const data = await api('/auth/register', { method: 'POST', body: { name, email, password } })
    setSession(data.token, data.user)
    setUser(data.user)
  }

  const logout = async () => {
    try {
      await api('/auth/logout', { method: 'POST' })
    } catch {
      // on se déconnecte quand même côté navigateur
    }
    clearSession()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)