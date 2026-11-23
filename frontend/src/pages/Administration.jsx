import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

const nombre = (n) => Number(n).toLocaleString('fr-FR')
const libelle = (cle) => cle.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())
const chiffres = (obj) => Object.entries(obj || {}).filter(([, v]) => typeof v === 'number')

function Chiffres({ titre, donnees }) {
  const liste = chiffres(donnees)
  if (liste.length === 0) return null
  return (
    <section>
      <h2>{titre}</h2>
      <div className="admin-stats">
        {liste.map(([cle, valeur]) => (
          <div className="admin-stat" key={cle}>
            <span>{libelle(cle)}</span>
            <strong>{nombre(valeur)}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function Administration() {
  const [enAttente, setEnAttente] = useState(null)
  const [biens, setBiens] = useState({})
  const [affectations, setAffectations] = useState({})

  useEffect(() => {
    api('/demandes/compte').then((d) => setEnAttente(d.en_attente)).catch(() => {})
    api('/biens/stats').then(setBiens).catch(() => {})
    api('/affectations/stats').then(setAffectations).catch(() => {})
  }, [])

  let message = 'Chargement…'
  if (enAttente !== null) {
    message = enAttente > 0 ? `${enAttente} demande(s) en attente de validation` : 'Aucune demande en attente'
  }

  return (
    <div className="page-admin">
      <div>
        <h1>Administration</h1>
        <p className="admin-sous-titre">Vue d’ensemble réservée à l’administrateur.</p>
      </div>

      <section className="admin-attente">
        <div>
          <strong>{message}</strong>
          <span>Proposées par les agents, elles attendent votre décision.</span>
        </div>
        <Link to="/validation" className="admin-bouton">Examiner</Link>
      </section>

      <Chiffres titre="Patrimoine" donnees={biens} />
      <Chiffres titre="Affectations et pannes" donnees={affectations} />

      <section>
        <h2>Raccourcis</h2>
        <div className="actions-grid">
          <Link className="action-card" to="/validation"><strong>Valider les demandes</strong><span>Accepter ou refuser les biens proposés par les agents.</span><em>Ouvrir</em></Link>
          <Link className="action-card" to="/biens"><strong>Gérer l’inventaire</strong><span>Ajouter, modifier ou supprimer un bien.</span><em>Ouvrir</em></Link>
          <Link className="action-card" to="/affectations"><strong>Affectations</strong><span>Affecter ou transférer un bien, consulter l’historique.</span><em>Ouvrir</em></Link>
          <Link className="action-card" to="/pannes"><strong>Pannes</strong><span>Suivre les pannes jusqu’à la remise en service.</span><em>Ouvrir</em></Link>
        </div>
      </section>
    </div>
  )
}