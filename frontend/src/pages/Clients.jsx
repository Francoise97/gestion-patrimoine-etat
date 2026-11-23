import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Clients() {
  const [clients, setClients] = useState([])
  const [recherche, setRecherche] = useState('')
  const [erreur, setErreur] = useState('')
  const [charge, setCharge] = useState(false)

  useEffect(() => {
    api('/auth/users')
      .then((r) => {
        const liste = Array.isArray(r) ? r : (r.data || [])
        setClients(liste.filter((u) => u.role === 'agent'))
      })
      .catch((e) => setErreur(e.message))
      .finally(() => setCharge(true))
  }, [])

  const q = recherche.trim().toLowerCase()
  const visibles = clients.filter(
    (c) => !q || (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q)
  )

  return (
    <div>
      <div className="page-head">
        <h2>Clients inscrits</h2>
      </div>
      <p className="muted hint">
        Tous les comptes clients créés depuis la page de connexion. {clients.length} client(s) au total.
      </p>

      {erreur && <div className="alert">{erreur}</div>}

      <div className="card">
        <div className="filters" style={{ gridTemplateColumns: '1fr' }}>
          <input
            placeholder="Rechercher par nom ou par e-mail"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>N°</th><th>Nom</th><th>E-mail</th><th>Inscrit le</th></tr>
            </thead>
            <tbody>
              {charge && visibles.length === 0 && (
                <tr><td colSpan="4" className="muted">Aucun client inscrit pour le moment</td></tr>
              )}
              {visibles.map((c, i) => (
                <tr key={c.id}>
                  <td>{i + 1}</td>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}