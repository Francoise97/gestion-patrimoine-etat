import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import Logo from '../components/Logo'
import { IconBox, IconDashboard, IconWrench } from '../components/Icons'

const IconTransfer = (p) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M7 7h13M16 3l4 4-4 4M17 17H4M8 13l-4 4 4 4" />
  </svg>
)

const FONCTIONS = [
  {
    icone: <IconBox width={28} height={28} />,
    titre: 'Inventaire des biens',
    texte: "Enregistrez, recherchez et suivez les bâtiments, véhicules, équipements informatiques, mobiliers et matériels de l'État.",
  },
  {
    icone: <IconTransfer />,
    titre: 'Affectations et transferts',
    texte: 'Affectez chaque bien à un ministère, transférez-le et conservez tout son historique.',
  },
  {
    icone: <IconWrench width={28} height={28} />,
    titre: 'Suivi de la maintenance',
    texte: 'Signalez les pannes et suivez leur traitement jusqu’à la remise en service.',
  },
  {
    icone: <IconDashboard width={28} height={28} />,
    titre: 'Tableau de bord',
    texte: 'Visualisez le nombre de biens, leur valeur et leur répartition en un coup d’œil.',
  },
]

const PROFILS = [
  { nom: 'Administrateur', texte: 'Gère les comptes utilisateurs, vérifie et enregistre les biens proposés.' },
  { nom: 'Gestionnaire du patrimoine', texte: 'Enregistre, modifie et affecte les biens.' },
  { nom: 'Agent de service', texte: 'Propose un bien à enregistrer, consulte les biens de son service et signale une panne.' },
  { nom: 'Auditeur', texte: "Consulte l'ensemble du patrimoine en lecture seule." },
]

export default function Home() {
  const { user } = useAuth()
  const cible = user ? '/tableau-de-bord' : '/login'
  const libelle = user ? 'Accéder à mon espace' : 'Se connecter'

  return (
    <div className="home">
      <header className="home-nav">
        <div className="home-brand">
          <Logo size={42} />
          <div className="brand-text">
            <strong>PATRIMOINE TOGO</strong>
            <small>République togolaise</small>
          </div>
        </div>
        <nav className="home-links">
          <a className="lien" href="#fonctions">Fonctionnalités</a>
          <a className="lien" href="#profils">Profils</a>
          <Link className="lien" to="/admin/login">Administration</Link>
          <Link className="btn-link" to={cible}>{libelle}</Link>
        </nav>
      </header>

      <section className="hero">
        <h1>Patrimoine Togo</h1>
        <p>
          La plateforme de gestion des biens de l'État togolais : inventaire, affectations,
          maintenance et suivi, en un seul endroit.
        </p>
        <div className="hero-actions">
          <Link className="btn-link" to={cible}>{libelle}</Link>
          <a className="btn-link ghost" href="#fonctions">Découvrir</a>
          <Link className="btn-link ghost" to="/admin/login">Espace administrateur</Link>
        </div>
        <small className="credit">Place de l'Indépendance, Lomé</small>
        <div className="flagbar" />
      </section>

      <section id="fonctions" className="section">
        <h2>Ce que vous pouvez faire</h2>
        <p className="sous-titre">Une gestion claire et traçable du patrimoine, de l'achat à la réforme.</p>
        <div className="cards">
          {FONCTIONS.map((f) => (
            <div className="feature" key={f.titre}>
              <div className="ico">{f.icone}</div>
              <h3>{f.titre}</h3>
              <p>{f.texte}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="profils" className="band">
        <div className="section">
          <h2>Pour qui ?</h2>
          <p className="sous-titre">Chaque utilisateur accède uniquement à ce qui concerne son rôle.</p>
          <div className="cards">
            {PROFILS.map((p) => (
              <div className="feature profil" key={p.nom}>
                <h3>{p.nom}</h3>
                <p>{p.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <Logo size={34} />
        <p>Patrimoine Togo - Projet pédagogique : données de démonstration, site non officiel.</p>
      </footer>
    </div>
  )
}