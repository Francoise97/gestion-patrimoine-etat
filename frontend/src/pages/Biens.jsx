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
  const [biens, setBiens] = useState([])
  const [filtres, setFiltres] = useState({ search: '', categorie_id: '', statut: '' })
  const [form, setForm] = useState(VIDE)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')

  const charger = () => {
    const q = new URLSearchParams()
    Object.entries(filtres).forEach(([k, v]) => v && q.set(k, v))
    api(`/biens?${q}`).then((d) => setBiens(d.data)).catch((e) => setErreur(e.message))
  }

  useEffect(() => {
    api('/categories').then(setCategories).catch((e) => setErreur(e.message))
  }, [])

  useEffect(charger, [filtres])

  const change = (champ) => (e) => setForm({ ...form, [champ]: e.target.value })
  const changeFiltre = (champ) => (e) => setFiltres({ ...filtres, [champ]: e.target.value })

  const enregistrer = async (e) => {
    e.preventDefault()
    setErreur('')
    setSucces('')
    try {
      await api('/biens', {
        method: 'POST',
        body: {
          ...form,
          categorie_id: Number(form.categorie_id),
          valeur: Number(form.valeur),
          date_acquisition: form.date_acquisition || null,
        },
      })
      setForm(VIDE)
      setSucces('Bien enregistré')
      charger()
    } catch (err) {
      const details = err.errors ? ' ' + Object.values(err.errors).flat().join(' ') : ''
      setErreur(err.message + details)
    }
  }

  const supprimer = async (bien) => {
    if (!window.confirm(`Supprimer « ${bien.designation} » ?`)) return
    setErreur('')
    try {
      await api(`/biens/${bien.id}`, { method: 'DELETE' })
      charger()
    } catch (err) {
      setErreur(err.message)
    }
  }

  return (
    <div>
      <h2>Inventaire des biens</h2>

      {erreur && <div className="alert">{erreur}</div>}
      {succes && <div className="success">{succes}</div>}

      {peutEcrire && (
        <form className="card" onSubmit={enregistrer}>
          <h3>Ajouter un bien</h3>
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
          <button type="submit" style={{ marginTop: 16 }}>Enregistrer le bien</button>
        </form>
      )}

      <div className="card">
        <div className="filters">
          <input placeholder="Rechercher une désignation..." value={filtres.search} onChange={changeFiltre('search')} />
          <select value={filtres.categorie_id} onChange={changeFiltre('categorie_id')}>
            <option value="">Toutes les catégories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.libelle}</option>)}
          </select>
          <select value={filtres.statut} onChange={changeFiltre('statut')}>
            <option value="">Tous les statuts</option>
            {STATUTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Code</th><th>Désignation</th><th>Catégorie</th><th>Valeur</th>
                <th>État</th><th>Statut</th>{peutEcrire && <th></th>}
              </tr>
            </thead>
            <tbody>
              {biens.length === 0 && (
                <tr><td colSpan={peutEcrire ? 7 : 6} className="muted">Aucun bien trouvé</td></tr>
              )}
              {biens.map((b) => (
                <tr key={b.id}>
                  <td>{b.code_inventaire}</td>
                  <td>{b.designation}</td>
                  <td>{b.categorie?.libelle}</td>
                  <td>{fcfa(b.valeur)}</td>
                  <td>{libelle(ETATS, b.etat)}</td>
                  <td><span className={`tag ${b.statut}`}>{libelle(STATUTS, b.statut)}</span></td>
                  {peutEcrire && (
                    <td><button className="secondary" onClick={() => supprimer(b)}>Supprimer</button></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}