import { useEffect, useState } from 'react'
import { urlPhoto } from '../photos'

export default function Diaporama({ photos }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (photos.length < 2) return undefined
    const minuteur = setInterval(() => setIndex((n) => (n + 1) % photos.length), 6000)
    return () => clearInterval(minuteur)
  }, [photos.length])

  if (photos.length === 0) return null
  const courante = photos[index % photos.length]

  return (
    <>
      <div className="hero-slides" aria-hidden="true">
        {photos.map((p, k) => (
          <div
            key={p.fichier}
            className={`hero-slide ${k === index % photos.length ? 'actif' : ''}`}
            style={{ backgroundImage: `url(${urlPhoto(p)})`, backgroundPosition: p.position || 'center' }}
          />
        ))}
      </div>
      <small className="hero-caption">
        {courante.titre}, {courante.lieu}
        {courante.credit ? ` - ${courante.credit}` : ''}
      </small>
    </>
  )
}