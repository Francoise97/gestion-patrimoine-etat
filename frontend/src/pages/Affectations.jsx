import { useEffect, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../auth'

const dateFr = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—')

export default function Affectations() {
  const { user } = useAuth()
  const peutEcrire = ['admin', 'gestionnaire'].includes(user.role)

  const [biens, setBiens] = useState([])
  const [services, setServices] = useState([])
  const [courantes, setCourantes] = useState({})
  const [bienId, setBienId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [motif, setMotif] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [historique, setHistorique] = useState([])
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')

  const chargerCourantes = () =>
    api('/affectations/courantes')
      .then((l) => setCourantes(Object.fromEntries(l.map((x) => [x.bien_id, x.service]))))
      .catch(() => {})

  useEffect(() => {
    const chargerBiens = async () => {
      const premiere = await api('/biens?page=1')
      let tous = [...premiere.data]
      for (let p = 2; p <= premiere.last_page; p++) {
        const suite = await api(`/biens?page=${p}`)
        tous = tous.concat(suite.data)
      }
      setBiens(tous.filter((b) => b.statut === 'en_service'))
    }
    chargerBiens().catch((e) => setErreur(e.message))
    api('/affectations/services').then(setServices).catch((e) => setErreur(e.message))
    chargerCourantes()
  }, [])

  const chargerHistorique = (id) => {
    if (!id) return setHistorique([])
    api(`/affectations/bien/${bienId}/historique`.replace('${bienId}', id))
      .then(setHistorique)
      .catch((e) => setErreur(e.message))
  }

  useEffect(() => chargerHistorique(bienId), [bienId])

  const actuel = bienId ? courantes[bienId] : null

  const envoyer = async (e) => {
    e.preventDefault()
    setErreur('')
    setSucces('')
    try {
      await api('/affectations', {
        method: 'POST',
        body: {
          bien_id: Number(bienId),
          service_id: Number(serviceId),
          motif: motif || null,
          date_debut: dateDebut || null,
        },
      })
      setSucces(actuel ? 'Bien transféré' : 'Bien affecté')
      setServiceId('')
      setMotif('')
      setDateDebut('')
      chargerCourantes()
      chargerHistorique(bienId)
    } catch (err) {
      const details = err.errors ? ' ' + Object.values(err.errors).flat().join(' ') : ''
      setErreur(err.message + details)
    }
  }

  return (
    <div>
      <div className="page-head">
        <h2>Affectations</h2>
      </div>

      {erreur && <div className="alert">{erreur}</div>}
      {succes && <div className="success">{succes}</div>}

      {peutEcrire && (
        <form className="card" onSubmit={envoyer}>
          <h3>Affecter ou transférer un bien</h3>
          <div className="form-grid">
            <div>
              <label>Bien</label>
              <select value={bienId} onChange={(e) => setBienId(e.target.value)} required>
                <option value="">Choisir un bien...</option>
                {biens.map((b) => (
                  <option key={b.id} value={b.id}>{b.code_inventaire} - {b.designation}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Ministère de destination</label>
              <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} required>
                <option value="">Choisir un ministère...</option>
                {services.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
              </select>
            </div>
            <div>
              <label>Motif</label>
              <input value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Ex. : renforcement des équipes" />
            </div>
            <div>
              <label>Date de début</label>
              <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
            </div>
          </div>
          {bienId && (
            <p className="muted hint">
              {actuel ? `Ministère actuel : ${actuel.nom}` : 'Ce bien n\'est affecté à aucun ministère.'}
            </p>
          )}
          <button type="submit" style={{ marginTop: 8 }}>{actuel ? 'Transférer' : 'Affecter'}</button>
        </form>
      )}

      <div className="card">
        <h3>Historique du bien</h3>
        {!peutEcrire && (
          <select value={bienId} onChange={(e) => setBienId(e.target.value)} style={{ marginBottom: 12 }}>
            <option value="">Choisir un bien...</option>
            {biens.map((b) => (
              <option key={b.id} value={b.id}>{b.code_inventaire} - {b.designation}</option>
            ))}
          </select>
        )}
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Ministère</th><th>Début</th><th>Fin</th><th>Motif</th></tr>
            </thead>
            <tbody>
              {!bienId && <tr><td colSpan="4" className="muted">Choisissez un bien pour voir son historique</td></tr>}
              {bienId && historique.length === 0 && <tr><td colSpan="4" className="muted">Aucune affectation enregistrée</td></tr>}
              {historique.map((h) => (
                <tr key={h.id}>
                  <td>{h.service?.nom}</td>
                  <td>{dateFr(h.date_debut)}</td>
                  <td>{h.date_fin ? dateFr(h.date_fin) : <span className="tag en_service">En cours</span>}</td>
                  <td>{h.motif || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}