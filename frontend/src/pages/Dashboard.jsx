import { useEffect, useState } from 'react'
import { api } from '../api'

const fcfa = (n) => Number(n || 0).toLocaleString('fr-FR') + ' FCFA'
const COULEURS = ['#1e3a8a', '#0ea5e9', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444']
const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
const nomMois = (cle) => MOIS[Number(cle.split('-')[1]) - 1]

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [aff, setAff] = useState(null)
  const [noms, setNoms] = useState({})
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    Promise.all([api('/biens/stats'), api('/affectations/stats'), api('/biens')])
      .then(([s, a, b]) => {
        setStats(s)
        setAff(a)
        setNoms(Object.fromEntries(b.data.map((x) => [x.id, x.designation])))
      })
      .catch((e) => setErreur(e.message))
  }, [])

  if (erreur) return <div className="alert">{erreur}</div>
  if (!stats || !aff) return <p>Chargement...</p>

  // Graphique circulaire : répartition des biens par catégorie
  const categories = stats.par_categorie.filter((c) => c.biens_count > 0)
  let cumul = 0
  const segments = categories.map((c, i) => {
    const debut = cumul
    cumul += (c.biens_count / stats.total) * 100
    return `${COULEURS[i % COULEURS.length]} ${debut}% ${cumul}%`
  })
  const fond = segments.length ? `conic-gradient(${segments.join(', ')})` : '#e5e7eb'

  // Graphique en barres : pannes signalées par mois
  const maxPannes = Math.max(1, ...aff.pannes_par_mois.map((m) => m.total))

  return (
    <div>
      <div className="page-head">
        <h2>Tableau de bord</h2>
      </div>

      <div className="grid">
        <div className="card stat">
          <span className="muted">📦 TOTAL BIENS</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="card stat">
          <span className="muted">💰 VALEUR TOTALE</span>
          <strong>{fcfa(stats.valeur_totale)}</strong>
        </div>
        <div className="card stat">
          <span className="muted">🛠️ MAINTENANCE EN COURS</span>
          <strong>{aff.maintenances_ouvertes}</strong>
        </div>
      </div>

      <div className="charts">
        <div className="card">
          <h3>Répartition par catégorie</h3>
          <div className="donut-wrap">
            <div className="donut" style={{ background: fond }}>
              <div className="donut-center">{stats.total}</div>
            </div>
            <ul className="legend">
              {categories.length === 0 && <li className="muted">Aucun bien pour le moment</li>}
              {categories.map((c, i) => (
                <li key={c.id}>
                  <span className="dot" style={{ background: COULEURS[i % COULEURS.length] }} />
                  {c.libelle} ({c.biens_count})
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card">
          <h3>Pannes signalées par mois</h3>
          <div className="bars">
            {aff.pannes_par_mois.map((m) => (
              <div className="bar-col" key={m.mois}>
                <span className="bar-val">{m.total}</span>
                <div className="bar-track">
                  <div className="bar" style={{ height: `${(m.total / maxPannes) * 100}%` }} />
                </div>
                <span className="bar-label">{nomMois(m.mois)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h3>Derniers mouvements</h3>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Date</th><th>Bien</th><th>Service</th><th>Statut</th></tr>
          </thead>
          <tbody>
            {aff.derniers_mouvements.length === 0 && (
              <tr><td colSpan="4" className="muted">Aucun mouvement pour le moment</td></tr>
            )}
            {aff.derniers_mouvements.map((m) => (
              <tr key={m.id}>
                <td>{new Date(m.date_debut).toLocaleDateString('fr-FR')}</td>
                <td>{noms[m.bien_id] || `Bien n°${m.bien_id}`}</td>
                <td>{m.service?.nom}</td>
                <td><span className={`tag ${m.date_fin ? 'cede' : 'en_service'}`}>{m.date_fin ? 'Clôturé' : 'Affecté'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}