import { useEffect, useState } from 'react'
import { PHOTOS, urlPhoto } from '../photos'

// Ne garde que les photos réellement présentes dans public/photos
export default function usePhotos() {
  const [disponibles, setDisponibles] = useState([])

  useEffect(() => {
    let actif = true
    PHOTOS.forEach((p) => {
      const img = new Image()
      img.onload = () => {
        if (!actif) return
        setDisponibles((liste) =>
          liste.some((x) => x.fichier === p.fichier)
            ? liste
            : [...liste, p].sort((a, b) => PHOTOS.indexOf(a) - PHOTOS.indexOf(b)),
        )
      }
      img.src = urlPhoto(p)
    })
    return () => { actif = false }
  }, [])

  return disponibles
}