import { useEffect, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../auth'

const STATUTS = { signale: 'Signalée', en_cours: 'En cours', resolu: 'Résolue' }

async function tousLesBiens() {
  let page = 1
  let derniere = 1
  let tout = []
  do {
    const reponse = await api(`/biens?page=${page}`)
    tout = tout.concat(reponse.data)
    derniere = reponse.last_page
    page += 1
  } while (page <= derniere)
  return tout
}

export default function Pannes() {
  const { user } = useAuth()
  const peutSignaler = ['admin', 'gestionnaire', 'agent'].includes(user.role)
  const peutTraiter = ['admin', 'gestionnaire'].includes(user.role)

  const [biens, setBiens] = useState([])
  const [liste, setListe] = useState({ data: [], current_page: 1, last_page: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [statut, setStatut] = useState('')
  const [selectionId, setSelectionId] = useState(null)
  const [afficherForm, setAfficherForm] = useState(false)
  const [bienId, setBienId] = useState('')
  const [description, setDescription] = useState('')
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')

  const noms = Object.fromEntries(biens.map((b) => [b.id, `${b.code_inventaire} - ${b.designation}`]))
  const selection = liste.data.find((m) => m.id === selectionId)

  const charger = () => {
    const q = new URLSearchParams({ page })
    if (statut) q.set('statut', statut)
    api(`/affectations/maintenances?${q}`).then(setListe).catch((e) => setErreur(e.message))
  }

  useEffect(() => {
    tousLesBiens().then(setBiens).catch((e) => setErreur(e.message))
  }, [])

  useEffect(() => { charger() }, [page, statut])
  useEffect(() => { setSelectionId(null) }, [page, statut])

  const signaler = async (e) => {
    e.preventDefault()
    setErreur('')
    setSucces('')
    try {
      await api('/affectations/maintenances', {
        method: 'POST',
        body: { bien_id: Number(bienId), description },
      })
      setBienId('')
      setDescription('')
      setAfficherForm(false)
      setSucces('Panne signalée : le gestionnaire ou l\u2019administrateur va la traiter.')
      if (page === 1) charger()
      else setPage(1)
    } catch (err) {
      const details = err.errors ? ' ' + Object.values(err.errors).flat().join(' ') : ''
      setErreur(err.message + details)
    }
  }

  const changerStatut = async (nouveau) => {
    if (!selection) return
    setErreur('')
    setSucces('')
    try {
      await api(`/affectations/maintenances/${selection.id}`, { method: 'PUT', body: { statut: nouveau } })
      setSucces(`La panne est passée à l\u2019état « ${STATUTS[nouveau]} ».`)
      setSelectionId(null)
      charger()
    } catch (err) {
      setErreur(err.message)
    }
  }

  return (
    <div>
      <div className="page-head">
        <h2>Pannes et maintenance</h2>
        <div className="toolbar">
          {peutSignaler && (
            <button onClick={() => setAfficherForm(!afficherForm)}>
              {afficherForm ? 'Fermer' : '+ Signaler une panne'}
            </button>
          )}
          {peutTraiter && (
            <>
              <button className="secondary" disabled={!selection || selection.statut === 'en_cours'} onClick={() => changerStatut('en_cours')}>
                Marquer en cours
              </button>
              <button className="secondary" disabled={!selection || selection.statut === 'resolu'} onClick={() => changerStatut('resolu')}>
                Marquer résolue
              </button>
            </>
          )}
        </div>
      </div>

      {peutTraiter && (
        <p className="muted hint">
          {selection
            ? `Panne sélectionnée : ${noms[selection.bien_id] || 'Bien n°' + selection.bien_id}`
            : 'Cliquez sur une panne pour la sélectionner, puis changez son statut.'}
        </p>
      )}

      {erreur && <div className="alert">{erreur}</div>}
      {succes && <div className="success">{succes}</div>}

      {afficherForm && (
        <form className="card" onSubmit={signaler}>
          <h3>Signaler une panne</h3>
          <label>Bien concerné</label>
          <select value={bienId} onChange={(e) => setBienId(e.target.value)} required>
            <option value="">Choisir un bien...</option>
            {biens.map((b) => (
              <option key={b.id} value={b.id}>{b.code_inventaire} - {b.designation}</option>
            ))}
          </select>
          <label>Description du problème</label>
          <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} required />
          <div className="actions" style={{ marginTop: 16 }}>
            <button type="submit">Envoyer le signalement</button>
            <button type="button" className="secondary" onClick={() => setAfficherForm(false)}>Annuler</button>
          </div>
        </form>
      )}

      <div className="card">
        <div className="filters" style={{ gridTemplateColumns: '1fr' }}>
          <select value={statut} onChange={(e) => { setPage(1); setStatut(e.target.value) }}>
            <option value="">Toutes les pannes</option>
            <option value="signale">Signalées</option>
            <option value="en_cours">En cours</option>
            <option value="resolu">Résolues</option>
          </select>
        </div>

        <div className="table-wrap">
          <table className={peutTraiter ? 'selectable' : ''}>
            <thead>
              <tr><th>Date</th><th>Bien</th><th>Description</th><th>Statut</th></tr>
            </thead>
            <tbody>
              {liste.data.length === 0 && (
                <tr><td colSpan="4" className="muted">Aucune panne</td></tr>
              )}
              {liste.data.map((m) => (
                <tr
                  key={m.id}
                  className={selectionId === m.id ? 'selected' : ''}
                  onClick={peutTraiter ? () => setSelectionId(selectionId === m.id ? null : m.id) : undefined}
                >
                  <td>{new Date(m.date_signalement).toLocaleDateString('fr-FR')}</td>
                  <td>{noms[m.bien_id] || `Bien n°${m.bien_id}`}</td>
                  <td>{m.description}</td>
                  <td><span className={`tag ${m.statut}`}>{STATUTS[m.statut] || m.statut}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pager">
          <button className="secondary" disabled={liste.current_page <= 1} onClick={() => setPage(liste.current_page - 1)}>Précédent</button>
          <span>Page {liste.current_page} sur {liste.last_page} ({liste.total} pannes)</span>
          <button className="secondary" disabled={liste.current_page >= liste.last_page} onClick={() => setPage(liste.current_page + 1)}>Suivant</button>
        </div>
      </div>
    </div>
  )
}