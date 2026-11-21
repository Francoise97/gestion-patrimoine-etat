import { useEffect, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../auth'

const fcfa = (n) => Number(n || 0).toLocaleString('fr-FR') + ' FCFA'

const ETATS = [['neuf', 'Neuf'], ['bon', 'Bon'], ['use', 'Usé'], ['hors_service', 'Hors service']]
const STATUTS = [['en_service', 'En service'], ['reforme', 'Réformé'], ['cede', 'Cédé']]
const libelle = (liste, v) => liste.find(([k]) => k === v)?.[1] ?? v

const VIDE = {
  code_inventaire: '', designation: '', categorie_id: '', valeur: '',
  date_acquisition: '', localisation: '', etat: 'neuf', statut: 'en_service',
}

export default function Biens() {
  const { user } = useAuth()
  const peutEcrire = ['admin', 'gestionnaire'].includes(user.role)

  const [categories, setCategories] = useState([])
  const [ministeres, setMinisteres] = useState({})
  const [liste, setListe] = useState({ data: [], current_page: 1, last_page: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [filtres, setFiltres] = useState({ search: '', categorie_id: '', etat: '', statut: '' })
  const [selectionId, setSelectionId] = useState(null)
  const [afficherForm, setAfficherForm] = useState(false)
  const [enEdition, setEnEdition] = useState(null)
  const [form, setForm] = useState(VIDE)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')

  const selectionne = liste.data.find((b) => b.id === selectionId)

  const charger = () => {
    const q = new URLSearchParams({ page })
    Object.entries(filtres).forEach(([k, v]) => v && q.set(k, v))
    api(`/biens?${q}`).then(setListe).catch((e) => setErreur(e.message))
    api('/affectations/courantes')
      .then((lignes) => setMinisteres(Object.fromEntries(lignes.map((l) => [l.bien_id, l.service?.nom]))))
      .catch(() => {})
  }

  useEffect(() => {
    api('/categories').then(setCategories).catch((e) => setErreur(e.message))
  }, [])

  useEffect(charger, [filtres, page])
  useEffect(() => setSelectionId(null), [filtres, page])

  const change = (champ) => (e) => setForm({ ...form, [champ]: e.target.value })
  const changeFiltre = (champ) => (e) => {
    setPage(1)
    setFiltres({ ...filtres, [champ]: e.target.value })
  }

  const fermerForm = () => {
    setAfficherForm(false)
    setEnEdition(null)
    setForm(VIDE)
  }

  const ouvrirNouveau = () => {
    if (afficherForm) return fermerForm()
    setErreur('')
    setSucces('')
    setEnEdition(null)
    setForm(VIDE)
    setAfficherForm(true)
  }

  const modifier = (b) => {
    if (!b) return
    setErreur('')
    setSucces('')
    setForm({
      code_inventaire: b.code_inventaire,
      designation: b.designation,
      categorie_id: String(b.categorie_id),
      valeur: String(Number(b.valeur)),
      date_acquisition: b.date_acquisition ? String(b.date_acquisition).slice(0, 10) : '',
      localisation: b.localisation || '',
      etat: b.etat,
      statut: b.statut,
    })
    setEnEdition(b.id)
    setAfficherForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const enregistrer = async (e) => {
    e.preventDefault()
    setErreur('')
    setSucces('')
    const corps = {
      ...form,
      categorie_id: Number(form.categorie_id),
      valeur: Number(form.valeur),
      date_acquisition: form.date_acquisition || null,
    }
    try {
      if (enEdition) {
        await api(`/biens/${enEdition}`, { method: 'PUT', body: corps })
        setSucces('Bien modifié')
      } else {
        await api('/biens', { method: 'POST', body: corps })
        setSucces('Bien enregistré')
      }
      fermerForm()
      charger()
    } catch (err) {
      const details = err.errors ? ' ' + Object.values(err.errors).flat().join(' ') : ''
      setErreur(err.message + details)
    }
  }

  const supprimer = async (bien) => {
    if (!bien) return
    if (!window.confirm(`Supprimer « ${bien.designation} » ?`)) return
    setErreur('')
    setSucces('')
    try {
      await api(`/biens/${bien.id}`, { method: 'DELETE' })
      setSucces('Bien supprimé')
      setSelectionId(null)
      if (liste.data.length === 1 && page > 1) setPage(page - 1)
      else charger()
    } catch (err) {
      setErreur(err.message)
    }
  }

  return (
    <div>
      <div className="page-head">
        <h2>Inventaire des biens</h2>
        {peutEcrire && (
          <div className="toolbar">
            <button onClick={ouvrirNouveau}>{afficherForm ? 'Fermer' : '+ Nouveau'}</button>
            
            
          </div>
        )}
      </div>

      {peutEcrire && (
        <p className="muted hint">
          {selectionne
            ? `Bien sélectionné : ${selectionne.code_inventaire} - ${selectionne.designation}`
            : 'Cliquez sur une ligne du tableau pour la sélectionner, puis utilisez Modifier ou Supprimer.'}
        </p>
      )}

      {erreur && <div className="alert">{erreur}</div>}
      {succes && <div className="success">{succes}</div>}

      {peutEcrire && afficherForm && (
        <form className="card" onSubmit={enregistrer}>
          <h3>{enEdition ? 'Modifier le bien' : 'Ajouter un bien'}</h3>
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
            <div>
              <label>Statut</label>
              <select value={form.statut} onChange={change('statut')}>
                {STATUTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="actions" style={{ marginTop: 16 }}>
            <button type="submit">{enEdition ? 'Enregistrer les modifications' : 'Enregistrer le bien'}</button>
            <button type="button" className="secondary" onClick={fermerForm}>Annuler</button>
          </div>
        </form>
      )}

      <div className="card">
        <div className="filters">
          <input placeholder="Rechercher une désignation..." value={filtres.search} onChange={changeFiltre('search')} />
          <select value={filtres.categorie_id} onChange={changeFiltre('categorie_id')}>
            <option value="">Toutes les catégories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.libelle}</option>)}
          </select>
          <select value={filtres.etat} onChange={changeFiltre('etat')}>
            <option value="">Tous les états</option>
            {ETATS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          <select value={filtres.statut} onChange={changeFiltre('statut')}>
            <option value="">Tous les statuts</option>
            {STATUTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>

        <div className="table-wrap">
          <table className={peutEcrire ? 'selectable' : ''}>
            <thead>
              <tr>
                <th>Code</th><th>Désignation</th><th>Catégorie</th><th>Localisation</th>
                <th>Ministère</th><th>Valeur</th><th>État</th><th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {liste.data.length === 0 && (
                <tr><td colSpan="8" className="muted">Aucun bien trouvé</td></tr>
              )}
              {liste.data.map((b) => (
                <tr
                  key={b.id}
                  className={selectionId === b.id ? 'selected' : ''}
                  onClick={peutEcrire ? () => setSelectionId(selectionId === b.id ? null : b.id) : undefined}
                >
                  <td>{b.code_inventaire}</td>
                  <td>{b.designation}</td>
                  <td>{b.categorie?.libelle}</td>
                  <td>{b.localisation || '—'}</td>
                  <td>{ministeres[b.id] || '—'}</td>
                  <td>{fcfa(b.valeur)}</td>
                  <td><span className={`etat ${b.etat}`}>{libelle(ETATS, b.etat)}</span></td>
                  <td><span className={`tag ${b.statut}`}>{libelle(STATUTS, b.statut)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {peutEcrire && (
          <div className="bottom-actions">
            <button className="secondary" disabled={!selectionne} onClick={() => modifier(selectionne)}>Modifier</button>
            <button className="danger" disabled={!selectionne} onClick={() => supprimer(selectionne)}>Supprimer</button>
          </div>
        )}

        <div className="pager">
          <button className="secondary" disabled={liste.current_page <= 1} onClick={() => setPage(liste.current_page - 1)}>
            Précédent
          </button>
          <span>Page {liste.current_page} sur {liste.last_page} ({liste.total} biens)</span>
          <button className="secondary" disabled={liste.current_page >= liste.last_page} onClick={() => setPage(liste.current_page + 1)}>
            Suivant
          </button>
        </div>
      </div>
    </div>
  )
}