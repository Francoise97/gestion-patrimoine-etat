import { useEffect, useState } from 'react'
import { api } from '../api'

const fcfa = (n) => Number(n || 0).toLocaleString('fr-FR') + ' FCFA'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/biens/stats').then(setStats).catch((e) => setError(e.message))
  }, [])

  if (error) return <div className="alert">{error}</div>
  if (!stats) return <p>Chargement...</p>

  return (
    <div>
      <h2>Tableau de bord</h2>

      <div className="grid">
        <div className="card stat">
          <span className="muted">Nombre de biens</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="card stat">
          <span className="muted">Valeur totale</span>
          <strong>{fcfa(stats.valeur_totale)}</strong>
        </div>
      </div>

      <h3>Répartition par catégorie</h3>
      <div className="card">
        <table>
          <thead>
            <tr><th>Catégorie</th><th>Biens</th><th>Valeur</th></tr>
          </thead>
          <tbody>
            {stats.par_categorie.map((c) => (
              <tr key={c.id}>
                <td>{c.libelle}</td>
                <td>{c.biens_count}</td>
                <td>{fcfa(c.biens_sum_valeur)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}