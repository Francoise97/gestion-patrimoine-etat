import { useEffect, useState } from 'react'
import { api } from '../api'

const fcfa = (n) => Number(n || 0).toLocaleString('fr-FR') + ' FCFA'
const ETATS = { neuf: 'Neuf', bon: 'Bon', use: 'Usé', hors_service: 'Hors service' }
const STATUTS = { en_attente: 'En attente', approuvee: 'Approuvée', rejetee: 'Rejetée' }

export default function Validation() {
  const [liste, setListe] = useState({ data: [], current_page: 1, last_page: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [statut, setStatut] = useState('en_attente')
  const [selectionId, setSelectionId] = useState(null)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')

  const selection = liste.data.find((d) => d.id === selectionId)
  const aTraiter = selection && selection.statut === 'en_attente'

  const charger = () => {
    const q = new URLSearchParams({ page })
    if (statut) q.set('statut', statut)
    api(`/demandes?${q}`).then(setListe).catch((e) => setErreur(e.message))
  }

  useEffect(() => { charger() }, [page, statut])
  useEffect(() => setSelectionId(null), [page, statut])

  const apres = (message) => {
    setSucces(message)
    setSelectionId(null)
    charger()
    window.dispatchEvent(new Event('demandes-changees'))
  }

  const approuver = async () => {
    if (!aTraiter) return
    if (!window.confirm(`Approuver et enregistrer « ${selection.designation} » dans l'inventaire ?`)) return
    setErreur('')
    setSucces('')
    try {
      await api(`/demandes/${selection.id}/approuver`, { method: 'POST' })
      apres(`« ${selection.designation} » a été approuvé et enregistré dans l'inventaire.`)
    } catch (err) {
      setErreur(err.message)
    }
  }

  const rejeter = async () => {
    if (!aTraiter) return
    const motif = window.prompt(`Motif du refus pour « ${selection.designation} » (facultatif) :`)
    if (motif === null) return
    setErreur('')
    setSucces('')
    try {
      await api(`/demandes/${selection.id}/rejeter`, { method: 'POST', body: { motif_rejet: motif || null } })
      apres(`La demande « ${selection.designation} » a été rejetée.`)
    } catch (err) {
      setErreur(err.message)
    }
  }

  return (
    <div>
      <div className="page-head">
        <h2>Validation des biens</h2>
        <div className="toolbar">
          <button disabled={!aTraiter} onClick={approuver}>Approuver</button>
          <button className="danger" disabled={!aTraiter} onClick={rejeter}>Rejeter</button>
        </div>
      </div>
      <p className="muted hint">
        {selection
          ? `Demande sélectionnée : ${selection.code_inventaire} - ${selection.designation} (proposée par ${selection.demandeur_nom})`
          : 'Cliquez sur une demande pour la sélectionner, puis utilisez Approuver ou Rejeter.'}
      </p>

      {erreur && <div className="alert">{erreur}</div>}
      {succes && <div className="success">{succes}</div>}

      <div className="card">
        <div className="filters" style={{ gridTemplateColumns: '1fr' }}>
          <select value={statut} onChange={(e) => { setPage(1); setStatut(e.target.value) }}>
            <option value="en_attente">Demandes en attente</option>
            <option value="approuvee">Demandes approuvées</option>
            <option value="rejetee">Demandes rejetées</option>
            <option value="">Toutes les demandes</option>
          </select>
        </div>

        <div className="table-wrap">
          <table className="selectable">
            <thead>
              <tr>
                <th>Date</th><th>Demandeur</th><th>Code</th><th>Désignation</th><th>Catégorie</th>
                <th>Localisation</th><th>Valeur</th><th>État</th><th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {liste.data.length === 0 && (
                <tr><td colSpan="9" className="muted">Aucune demande</td></tr>
              )}
              {liste.data.map((d) => (
                <tr
                  key={d.id}
                  className={selectionId === d.id ? 'selected' : ''}
                  onClick={() => setSelectionId(selectionId === d.id ? null : d.id)}
                >
                  <td>{new Date(d.created_at).toLocaleDateString('fr-FR')}</td>
                  <td>{d.demandeur_nom}</td>
                  <td>{d.code_inventaire}</td>
                  <td>{d.designation}</td>
                  <td>{d.categorie?.libelle}</td>
                  <td>{d.localisation || '—'}</td>
                  <td>{fcfa(d.valeur)}</td>
                  <td>{ETATS[d.etat] || d.etat}</td>
                  <td><span className={`tag ${d.statut}`}>{STATUTS[d.statut]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pager">
          <button className="secondary" disabled={liste.current_page <= 1} onClick={() => setPage(liste.current_page - 1)}>Précédent</button>
          <span>Page {liste.current_page} sur {liste.last_page} ({liste.total} demandes)</span>
          <button className="secondary" disabled={liste.current_page >= liste.last_page} onClick={() => setPage(liste.current_page + 1)}>Suivant</button>
        </div>
      </div>
    </div>
  )
}