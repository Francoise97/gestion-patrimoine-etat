import { createContext, useContext, useState } from 'react'
import { api, setSession, clearSession, getUser } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getUser())

  const login = async (email, password) => {
    const data = await api('/auth/login', { method: 'POST', body: { email, password } })
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

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)