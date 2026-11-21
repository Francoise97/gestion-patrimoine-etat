import { useEffect, useState } from 'react'
import { api } from '../api'

const fcfa = (n) => Number(n || 0).toLocaleString('fr-FR') + ' FCFA'
const ETATS = [['neuf', 'Neuf'], ['bon', 'Bon'], ['use', 'Usé'], ['hors_service', 'Hors service']]
const libelleEtat = (v) => ETATS.find(([k]) => k === v)?.[1] ?? v
const STATUTS = { en_attente: 'En attente', approuvee: 'Approuvée', rejetee: 'Rejetée' }

export default function Validation() {
  const [categories, setCategories] = useState([])
  const [liste, setListe] = useState({ data: [], current_page: 1, last_page: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [statut, setStatut] = useState('en_attente')
  const [selectionId, setSelectionId] = useState(null)
  const [edition, setEdition] = useState(null)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')

  const selection = liste.data.find((d) => d.id === selectionId)
  const aTraiter = selection && selection.statut === 'en_attente'

  const charger = () => {
    const q = new URLSearchParams({ page })
    if (statut) q.set('statut', statut)
    api(`/demandes?${q}`).then(setListe).catch((e) => setErreur(e.message))
  }

  useEffect(() => {
    api('/categories').then(setCategories).catch((e) => setErreur(e.message))
  }, [])

  useEffect(() => { charger() }, [page, statut])
  useEffect(() => { setSelectionId(null); setEdition(null) }, [page, statut])

  const apres = (message) => {
    setSucces(message)
    setSelectionId(null)
    setEdition(null)
    charger()
    window.dispatchEvent(new Event('demandes-changees'))
  }

  // Ouvre le formulaire rempli avec les données envoyées par le client
  const ouvrirEnregistrement = () => {
    if (!aTraiter) return
    setErreur('')
    setSucces('')
    setEdition({
      code_inventaire: selection.code_inventaire,
      designation: selection.designation,
      categorie_id: String(selection.categorie_id),
      valeur: String(Number(selection.valeur)),
      date_acquisition: selection.date_acquisition ? String(selection.date_acquisition).slice(0, 10) : '',
      localisation: selection.localisation || '',
      etat: selection.etat,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const change = (champ) => (e) => setEdition({ ...edition, [champ]: e.target.value })

  const enregistrer = async (e) => {
    e.preventDefault()
    setErreur('')
    setSucces('')
    try {
      await api(`/demandes/${selection.id}/approuver`, {
        method: 'POST',
        body: {
          ...edition,
          categorie_id: Number(edition.categorie_id),
          valeur: Number(edition.valeur),
          date_acquisition: edition.date_acquisition || null,
        },
      })
      apres(`« ${edition.designation} » a été enregistré dans l'inventaire.`)
    } catch (err) {
      const details = err.errors ? ' ' + Object.values(err.errors).flat().join(' ') : ''
      setErreur(err.message + details)
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
          <button disabled={!aTraiter} onClick={ouvrirEnregistrement}>Enregistrer dans l'inventaire</button>
          <button className="danger" disabled={!aTraiter} onClick={rejeter}>Rejeter</button>
        </div>
      </div>
      <p className="muted hint">
        {selection
          ? `Demande sélectionnée : ${selection.code_inventaire} - ${selection.designation} (proposée par ${selection.demandeur_nom})`
          : "Cliquez sur une demande pour la sélectionner : vous pourrez vérifier ses données, les corriger, puis l'enregistrer."}
      </p>

      {erreur && <div className="alert">{erreur}</div>}
      {succes && <div className="success">{succes}</div>}

      {edition && selection && (
        <form className="card" onSubmit={enregistrer}>
          <h3>Vérifier et enregistrer le bien</h3>
          <p className="muted">Données envoyées par {selection.demandeur_nom} : corrigez-les si nécessaire avant l'enregistrement.</p>
          <div className="form-grid">
            <div>
              <label>Code d'inventaire</label>
              <input value={edition.code_inventaire} onChange={change('code_inventaire')} required />
            </div>
            <div>
              <label>Désignation</label>
              <input value={edition.designation} onChange={change('designation')} required />
            </div>
            <div>
              <label>Catégorie</label>
              <select value={edition.categorie_id} onChange={change('categorie_id')} required>
                <option value="">Choisir...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.libelle}</option>)}
              </select>
            </div>
            <div>
              <label>Valeur (FCFA)</label>
              <input type="number" min="0" value={edition.valeur} onChange={change('valeur')} required />
            </div>
            <div>
              <label>Date d'acquisition</label>
              <input type="date" value={edition.date_acquisition} onChange={change('date_acquisition')} />
            </div>
            <div>
              <label>Localisation</label>
              <input value={edition.localisation} onChange={change('localisation')} />
            </div>
            <div>
              <label>État</label>
              <select value={edition.etat} onChange={change('etat')}>
                {ETATS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="actions" style={{ marginTop: 16 }}>
            <button type="submit">Enregistrer dans l'inventaire</button>
            <button type="button" className="secondary" onClick={() => setEdition(null)}>Annuler</button>
          </div>
        </form>
      )}

      <div className="card">
        <div className="filters" style={{ gridTemplateColumns: '1fr' }}>
          <select value={statut} onChange={(e) => { setPage(1); setStatut(e.target.value) }}>
            <option value="en_attente">Demandes en attente</option>
            <option value="approuvee">Demandes enregistrées</option>
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
                  onClick={() => { setEdition(null); setSelectionId(selectionId === d.id ? null : d.id) }}
                >
                  <td>{new Date(d.created_at).toLocaleDateString('fr-FR')}</td>
                  <td>{d.demandeur_nom}</td>
                  <td>{d.code_inventaire}</td>
                  <td>{d.designation}</td>
                  <td>{d.categorie?.libelle}</td>
                  <td>{d.localisation || '—'}</td>
                  <td>{fcfa(d.valeur)}</td>
                  <td>{libelleEtat(d.etat)}</td>
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