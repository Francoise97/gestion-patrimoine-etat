export const getToken = () => localStorage.getItem('token')

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'))
  } catch {
    return null
  }
}

export const setSession = (token, user) => {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

export const clearSession = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

// Appelle l'API (via le gateway) en ajoutant le token
export async function api(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' }
  if (body) headers['Content-Type'] = 'application/json'

  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return null
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    if (res.status === 401 && token) {
      clearSession()
      window.location.href = '/login'
    }
    const err = new Error(data.message || 'Une erreur est survenue')
    err.status = res.status
    err.errors = data.errors
    throw err
  }
  return data
}