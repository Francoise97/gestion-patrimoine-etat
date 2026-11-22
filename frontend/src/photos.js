// Photos du Togo, dans frontend/public/photos/
// credit : auteur et licence de la photo, par exemple
// credit: 'Photo : Nom de l\'auteur, CC BY-SA 4.0, Wikimedia Commons'
// position : cadrage dans le diaporama ; hero : false pour l'exclure du diaporama
export const PHOTOS = [
  { fichier: 'place-independance.jpg', titre: "Place de l'Indépendance", lieu: 'Lomé', credit: '', position: 'center 30%', hero: true },
  { fichier: 'palais-des-congres.jpg', titre: 'Palais des Congrès', lieu: 'Lomé', credit: '', position: 'center 45%', hero: true },
  { fichier: 'cathedrale-lome.jpg', titre: 'Cathédrale du Sacré-Cœur', lieu: 'Lomé', credit: '', position: 'center 12%', hero: true },
  { fichier: 'grand-marche.jpg', titre: 'Cathédrale et Grand Marché', lieu: 'Lomé', credit: '', position: 'center 20%', hero: false },
  { fichier: 'hotel-2-fevrier.jpg', titre: 'Hôtel du 2 Février', lieu: 'Lomé', credit: '', position: 'center', hero: true },
  { fichier: 'palais-de-justice.jpg', titre: 'Palais de Justice', lieu: 'Lomé', credit: '', position: 'center', hero: true },
]

export const urlPhoto = (p) => `/photos/${p.fichier}`