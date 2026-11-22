import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { api } from '../api'

const ROLES = {
  admin: 'Administrateur',
  gestionnaire: 'Gestionnaire du patrimoine',
  agent: 'Agent de service',
  auditeur: 'Auditeur',
}

const ACTIONS = {
  admin: [
    { titre: 'Vérifier et enregistrer les biens', texte: 'Examinez les demandes des agents, corrigez-les si besoin, puis enregistrez-les.', lien: '/validation', bouton: 'Ouvrir la validation', badge: true },
    { titre: "Gérer l'inventaire", texte: 'Ajouter, modifier ou supprimer un bien.', lien: '/biens', bouton: "Ouvrir l'inventaire" },
    { titre: 'Affecter et transférer', texte: 'Affecter un bien à un ministère et suivre son historique.', lien: '/affectations', bouton: 'Ouvrir les affectations' },
    { titre: 'Suivre les pannes', texte: 'Consulter les pannes signalées et les faire avancer.', lien: '/pannes', bouton: 'Ouvrir les pannes' },
  ],
  gestionnaire: [
    { titre: "Gérer l'inventaire", texte: 'Ajouter, modifier ou supprimer un bien.', lien: '/biens', bouton: "Ouvrir l'inventaire" },
    { titre: 'Affecter et transférer', texte: 'Affecter un bien à un ministère et suivre son historique.', lien: '/affectations', bouton: 'Ouvrir les affectations' },
    { titre: 'Suivre les pannes', texte: 'Consulter les pannes signalées et les faire avancer.', lien: '/pannes', bouton: 'Ouvrir les pannes' },
  ],
  agent: [
    { titre: 'Proposer un bien', texte: "Remplissez le formulaire : l'administrateur vérifiera puis enregistrera le bien.", lien: '/mes-demandes', bouton: 'Proposer un bien' },
    { titre: "Consulter l'inventaire", texte: 'Rechercher les biens et voir leur état et leur ministère.', lien: '/biens', bouton: "Ouvrir l'inventaire" },
    { titre: 'Signaler une panne', texte: 'Choisissez le bien concerné et décrivez le problème.', lien: '/pannes', bouton: 'Signaler une panne' },
  ],
  auditeur: [
    { titre: "Consulter l'inventaire", texte: "Parcourir l'ensemble du patrimoine en lecture seule.", lien: '/biens', bouton: "Ouvrir l'inventaire" },
    { titre: 'Consulter les pannes', texte: 'Voir les pannes signalées et leur avancement.', lien: '/pannes', bouton: 'Ouvrir les pannes' },
  ],
}

const CIRCUITS = {
  agent: ['Vous proposez un bien', "L'administrateur vérifie les données", "Le bien entre dans l'inventaire"],
  admin: ['Un agent propose un bien', 'Vous vérifiez et corrigez les données', 'Vous enregistrez le bien'],
}

export default function ActionsRapides() {
  const { user } = useAuth()
  const [enAttente, setEnAttente] = useState(0)

  useEffect(() => {
    if (user.role !== 'admin') return
    api('/demandes/compte').then((d) => setEnAttente(d.en_attente)).catch(() => {})
  }, [user.role])

  const actions = ACTIONS[user.role] || []
  const circuit = CIRCUITS[user.role]

  return (
    <section className="actions-section">
      <h3>Bienvenue, {user.name}</h3>
      <p className="muted">
        Vous êtes connecté en tant que <strong>{ROLES[user.role] || user.role}</strong>. Voici ce que vous pouvez faire :
      </p>

      {circuit && (
        <ol className="circuit">
          {circuit.map((etape, i) => (
            <li key={etape}><span>{i + 1}</span>{etape}</li>
          ))}
        </ol>
      )}

      <div className="actions-grid">
        {actions.map((a) => (
          <Link className="action-card" to={a.lien} key={a.lien}>
            <strong>
              {a.titre}
              {a.badge && enAttente > 0 && <span className="pastille">{enAttente}</span>}
            </strong>
            <span>{a.texte}</span>
            <em>{a.bouton} →</em>
          </Link>
        ))}
      </div>
    </section>
  )
}