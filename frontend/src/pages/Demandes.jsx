import { useEffect, useState } from 'react'
import { api } from '../api'

const fcfa = (n) => Number(n || 0).toLocaleString('fr-FR') + ' FCFA'
const ETATS = [['neuf', 'Neuf'], ['bon', 'Bon'], ['use', 'Usé'], ['hors_service', 'Hors service']]
const STATUTS = { en_attente: 'En attente', approuvee: 'Approuvée', rejetee: 'Rejetée' }
const VIDE = {
  code_inventaire: '', designation: '', categorie_id: '', valeur: '',
  date_acquisition: '', localisation: '', etat: 'neuf',
}

export default function Demandes() {
  const [categories, setCategories] = useState([])
  const [liste, setListe] = useState({ data: [], current_page: 1, last_page: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [afficherForm, setAfficherForm] = useState(false)
  const [form, setForm] = useState(VIDE)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')

  const charger = () => {
    api(`/demandes?page=${page}`).then(setListe).catch((e) => setErreur(e.message))
  }

  useEffect(() => {
    api('/categories').then(setCategories).catch((e) => setErreur(e.message))
  }, [])

  useEffect(() => { charger() }, [page])

  const change = (champ) => (e) => setForm({ ...form, [champ]: e.target.value })

  const envoyer = async (e) => {
    e.preventDefault()
    setErreur('')
    setSucces('')
    try {
      await api('/demandes', {
        method: 'POST',
        body: {
          ...form,
          categorie_id: Number(form.categorie_id),
          valeur: Number(form.valeur),
          date_acquisition: form.date_acquisition || null,
        },
      })
      setForm(VIDE)
      setAfficherForm(false)
      setSucces("Demande envoyée : l'administrateur doit l'approuver avant l'enregistrement du bien.")
      if (page === 1) charger()
      else setPage(1)
    } catch (err) {
      const details = err.errors ? ' ' + Object.values(err.errors).flat().join(' ') : ''
      setErreur(err.message + details)
    }
  }

  const observation = (d) => {
    if (d.statut === 'approuvee') return "Enregistré dans l'inventaire"
    if (d.statut === 'rejetee') return d.motif_rejet || 'Aucun motif indiqué'
    return "En attente de validation par l'administrateur"
  }

  return (
    <div>
      <div className="page-head">
        <h2>Proposer un bien</h2>
        <div className="toolbar">
          <button onClick={() => setAfficherForm(!afficherForm)}>{afficherForm ? 'Fermer' : '+ Nouvelle demande'}</button>
        </div>
      </div>
      <p className="muted hint">
        Votre demande sera examinée par l'administrateur. Le bien n'entre dans l'inventaire qu'une fois approuvé.
      </p>

      {erreur && <div className="alert">{erreur}</div>}
      {succes && <div className="success">{succes}</div>}

      {afficherForm && (
        <form className="card" onSubmit={envoyer}>
          <h3>Nouvelle demande d'enregistrement</h3>
          <div className="form-grid">
            <div>
              <label>Code d'inventaire</label>
              <input value={form.code_inventaire} onChange={change('code_inventaire')} required />
            </div>
            <div>
              <label>Désignation</label>
              <input value={form.designation} onChange={change('designation')} required />
            </div>
            <div>
              <label>Catégorie</label>
              <select value={form.categorie_id} onChange={change('categorie_id')} required>
                <option value="">Choisir...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.libelle}</option>)}
              </select>
            </div>
            <div>
              <label>Valeur (FCFA)</label>
              <input type="number" min="0" value={form.valeur} onChange={change('valeur')} required />
            </div>
            <div>
              <label>Date d'acquisition</label>
              <input type="date" value={form.date_acquisition} onChange={change('date_acquisition')} />
            </div>
            <div>
              <label>Localisation</label>
              <input value={form.localisation} onChange={change('localisation')} />
            </div>
            <div>
              <label>État</label>
              <select value={form.etat} onChange={change('etat')}>
                {ETATS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="actions" style={{ marginTop: 16 }}>
            <button type="submit">Envoyer la demande</button>
            <button type="button" className="secondary" onClick={() => setAfficherForm(false)}>Annuler</button>
          </div>
        </form>
      )}

      <h3>Mes demandes</h3>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Code</th><th>Désignation</th><th>Catégorie</th><th>Valeur</th><th>Statut</th><th>Observation</th></tr>
            </thead>
            <tbody>
              {liste.data.length === 0 && (
                <tr><td colSpan="6" className="muted">Vous n'avez encore envoyé aucune demande</td></tr>
              )}
              {liste.data.map((d) => (
                <tr key={d.id}>
                  <td>{d.code_inventaire}</td>
                  <td>{d.designation}</td>
                  <td>{d.categorie?.libelle}</td>
                  <td>{fcfa(d.valeur)}</td>
                  <td><span className={`tag ${d.statut}`}>{STATUTS[d.statut]}</span></td>
                  <td>{observation(d)}</td>
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