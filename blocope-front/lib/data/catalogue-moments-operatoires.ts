export type CategorieMoment = 'ANESTHESIE' | 'CHIRURGIE' | 'DIVERS'

export const CATALOGUE_MOMENTS: Record<CategorieMoment, { titre: string; items: string[] }> = {
  ANESTHESIE: {
    titre: 'Anesthésie',
    items: [
      'Arrivée en salle',
      'Installation du patient',
      'Pose voie veineuse',
      'Induction anesthésique',
      'Intubation',
      'Extubation',
      'Réveil anesthésique',
    ],
  },
  CHIRURGIE: {
    titre: 'Chirurgie',
    items: [
      'Antisepsie / badigeonnage',
      'Champage',
      'Incision',
      'Ouverture',
      'Exploration',
      'Début du geste principal',
      'Fin du geste principal',
      'Hémostase',
      'Fermeture pariétale',
      'Fermeture cutanée',
      'Pansement',
    ],
  },
  DIVERS: {
    titre: 'Divers',
    items: [
      'Antibioprophylaxie administrée',
      'Début transfusion',
      'Fin transfusion',
      'Incident / complication',
      'Sortie de salle',
    ],
  },
}
