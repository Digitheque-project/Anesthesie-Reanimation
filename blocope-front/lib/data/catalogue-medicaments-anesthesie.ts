import type { MedicamentTableAccent } from '@/components/bloc/medicaments-anesthesie/MedicamentTable'

// Source : fiche papier « USFR Anesthésie Réanimation — CHU Fianarantsoa » + mockup HTML
// « Liste des médicaments nécessaires pour l'Anesthésie et la Réanimation ». Les en-têtes de
// section du mockup annoncent des comptes qui ne correspondent pas toujours au nombre réel de
// lignes, et son bandeau annonce « 72 articles » alors que la somme réelle des lignes
// ci-dessous est 77. On transcrit les lignes réelles (source de vérité), sans forcer
// artificiellement le total à 72.

export type CategorieMedicament =
  | 'SERUMS'
  | 'PRODUITS_ANESTHESIQUES'
  | 'ANTALGIQUES'
  | 'KIT_ASEPSIE'
  | 'ANTIBIOTIQUES_AUTRES'
  | 'DISPOSITIFS_MEDICAUX'
  | 'CONSOMMABLES'

export type CategorieMedicamentDef = {
  titre: string
  accent: MedicamentTableAccent
  items: string[]
}

export const CATALOGUE_MEDICAMENTS: Record<CategorieMedicament, CategorieMedicamentDef> = {
  SERUMS: {
    titre: 'Sérums',
    accent: 'primary',
    items: [
      'SGH 5% (disponible en 5% et 10%)',
      'SSI 9%',
      'Ringer Lactate (RL)',
      'Hestar',
      'DNS',
      'Mannitol 20%',
      'Sérum composé',
    ],
  }, // 7
  PRODUITS_ANESTHESIQUES: {
    titre: 'Produits anesthésiques',
    accent: 'secondary',
    items: [
      'Nesdonal 1g',
      'Pancuronium 4mg / Vécuronium 4mg',
      'Fentanyl',
      'Kétamine 500mg',
      'Provive 1% / Propofol Lipuro 1%',
      'Diazépam 10mg inj / Midazolam inj',
      'Atropine',
      'Atarax 100mg inj',
      'Bupivacaïne Rachi 0,50%',
      'Bupivacaïne ALR 0,50% sans Adré',
      'Bupivacaïne ALR 0,50% avec Adré',
      'Lidocaïne 1%–2% (avec/sans Adré)',
      'Stimuplex',
      "Sévoflurane (remplace l'Halothane)",
    ],
  }, // 14
  ANTALGIQUES: {
    titre: 'Antalgiques',
    accent: 'tertiary',
    items: [
      'Perfalgan',
      'Doliprane suppo',
      'Profénid',
      'Lamaline suppo',
      'Nifluril',
      'Tramadol',
      'Acupan',
    ],
  }, // 7
  KIT_ASEPSIE: {
    titre: 'Kit pour asepsie',
    accent: 'primary-container',
    items: [
      'Blouse stérile',
      'Calot',
      'Champ stérile',
      'Set pour voie centrale',
      'Set pour voie périphérique',
      'Set pour sondage urinaire',
      'Gants stériles',
      'Gants non stériles',
      'Kit bloc',
    ],
  }, // 9
  ANTIBIOTIQUES_AUTRES: {
    titre: 'Antibiotiques & autres',
    accent: 'error',
    items: [
      'Flagyl',
      'Céfuroxime',
      'Métronidazole',
      'Héparine (Lovenox)',
      'Méthylprednisolone',
      'Loxen',
      'Calcium',
      'Nitriderm',
    ],
  }, // 8
  DISPOSITIFS_MEDICAUX: {
    titre: 'Dispositifs médicaux',
    accent: 'inverse-primary',
    items: [
      'Perfuseur',
      'Perfuseur pédiatrique',
      'Transfuseur',
      'Cathéter veineux (24G-16G)',
      'Kit pour voie centrale',
      'Kit pour APD (péridurale)',
      'Aiguille PL',
      'Robinet à 3 voies',
      'Électrode',
      "Sonde d'intubation (CH3-8)",
      'Filtre antibactérien avec connecteur',
      'Canule de Guedel (N°00-3)',
      "Sonde d'aspiration (CH14-6)",
      'Sonde nasogastrique',
      'Drain de Redon (CH12-16)',
      'Sonde vésicale (CH8-22)',
      'Poche à urine',
    ],
  }, // 17
  CONSOMMABLES: {
    titre: 'Consommables',
    accent: 'secondary',
    items: [
      'Coton',
      'Alcool',
      'Sparadrap standard 70cm',
      'Dakin Cooper stabilisé',
      'Bétadine jaune',
      'Bétadine rouge',
      'Seringue 50cc',
      'Seringue 20cc',
      'Seringue 10cc',
      'Seringue 5cc',
      'Sécurefix PM/GM',
      'Lunettes nasales',
      'Lunettes nasales enfant',
      'Kit AG',
      'Kit ALR',
    ],
  }, // 15
}
// Total réel : 7+14+7+9+8+17+15 = 77

export const TOTAL_MEDICAMENTS = Object.values(CATALOGUE_MEDICAMENTS).reduce(
  (total, categorie) => total + categorie.items.length,
  0,
)
