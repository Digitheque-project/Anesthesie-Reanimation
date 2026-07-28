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

export type MedicamentItemDef = {
  /** Libellé affiché et clé de rapprochement (Pharmacie, CPA déjà enregistrées) — ne jamais
   * modifier une fois publié, sous peine de casser le rapprochement des dossiers existants. */
  label: string
  /** Valeurs cliquables pour remplir directement le champ Dosage/Quantité sans avoir à les
   * taper (concentration, calibre, nom alternatif...) — toujours reprises telles quelles du
   * libellé/de la fiche source ci-dessus, jamais une posologie inventée. Absent quand l'article
   * n'offre qu'une seule valeur possible. */
  variantes?: string[]
}

export type CategorieMedicamentDef = {
  titre: string
  accent: MedicamentTableAccent
  icon: string
  items: MedicamentItemDef[]
}

export const CATALOGUE_MEDICAMENTS: Record<CategorieMedicament, CategorieMedicamentDef> = {
  SERUMS: {
    titre: 'Sérums',
    accent: 'primary',
    icon: 'water_drop',
    items: [
      { label: 'SGH 5% (disponible en 5% et 10%)', variantes: ['5%', '10%'] },
      { label: 'SSI 9%' },
      { label: 'Ringer Lactate (RL)' },
      { label: 'Hestar' },
      { label: 'DNS' },
      { label: 'Mannitol 20%' },
      { label: 'Sérum composé' },
    ],
  }, // 7
  PRODUITS_ANESTHESIQUES: {
    titre: 'Produits anesthésiques',
    accent: 'secondary',
    icon: 'vaccines',
    items: [
      { label: 'Nesdonal 1g' },
      { label: 'Pancuronium 4mg / Vécuronium 4mg', variantes: ['Pancuronium 4mg', 'Vécuronium 4mg'] },
      { label: 'Fentanyl' },
      { label: 'Kétamine 500mg' },
      { label: 'Provive 1% / Propofol Lipuro 1%', variantes: ['Provive 1%', 'Propofol Lipuro 1%'] },
      { label: 'Diazépam 10mg inj / Midazolam inj', variantes: ['Diazépam 10mg inj', 'Midazolam inj'] },
      { label: 'Atropine' },
      { label: 'Atarax 100mg inj' },
      { label: 'Bupivacaïne Rachi 0,50%' },
      { label: 'Bupivacaïne ALR 0,50% sans Adré' },
      { label: 'Bupivacaïne ALR 0,50% avec Adré' },
      {
        label: 'Lidocaïne 1%–2% (avec/sans Adré)',
        variantes: ['1% sans Adré', '1% avec Adré', '2% sans Adré', '2% avec Adré'],
      },
      { label: 'Stimuplex' },
      { label: "Sévoflurane (remplace l'Halothane)" },
    ],
  }, // 14
  ANTALGIQUES: {
    titre: 'Antalgiques',
    accent: 'tertiary',
    icon: 'medication',
    items: [
      { label: 'Perfalgan' },
      { label: 'Doliprane suppo' },
      { label: 'Profénid' },
      { label: 'Lamaline suppo' },
      { label: 'Nifluril' },
      { label: 'Tramadol' },
      { label: 'Acupan' },
    ],
  }, // 7
  KIT_ASEPSIE: {
    titre: 'Kit pour asepsie',
    accent: 'primary-container',
    icon: 'sanitizer',
    items: [
      { label: 'Blouse stérile' },
      { label: 'Calot' },
      { label: 'Champ stérile' },
      { label: 'Set pour voie centrale' },
      { label: 'Set pour voie périphérique' },
      { label: 'Set pour sondage urinaire' },
      { label: 'Gants stériles' },
      { label: 'Gants non stériles' },
      { label: 'Kit bloc' },
    ],
  }, // 9
  ANTIBIOTIQUES_AUTRES: {
    titre: 'Antibiotiques & autres',
    accent: 'error',
    icon: 'biotech',
    items: [
      { label: 'Flagyl' },
      { label: 'Céfuroxime' },
      { label: 'Métronidazole' },
      { label: 'Héparine (Lovenox)' },
      { label: 'Méthylprednisolone' },
      { label: 'Loxen' },
      { label: 'Calcium' },
      { label: 'Nitriderm' },
    ],
  }, // 8
  DISPOSITIFS_MEDICAUX: {
    titre: 'Dispositifs médicaux',
    accent: 'inverse-primary',
    icon: 'medical_services',
    items: [
      { label: 'Perfuseur' },
      { label: 'Perfuseur pédiatrique' },
      { label: 'Transfuseur' },
      { label: 'Cathéter veineux (24G-16G)', variantes: ['24G', '22G', '20G', '18G', '16G'] },
      { label: 'Kit pour voie centrale' },
      { label: 'Kit pour APD (péridurale)' },
      { label: 'Aiguille PL' },
      { label: 'Robinet à 3 voies' },
      { label: 'Électrode' },
      { label: "Sonde d'intubation (CH3-8)", variantes: ['CH3', 'CH4', 'CH5', 'CH6', 'CH7', 'CH8'] },
      { label: 'Filtre antibactérien avec connecteur' },
      { label: 'Canule de Guedel (N°00-3)', variantes: ['N°00', 'N°0', 'N°1', 'N°2', 'N°3'] },
      { label: "Sonde d'aspiration (CH14-6)", variantes: ['CH14', 'CH12', 'CH10', 'CH8', 'CH6'] },
      { label: 'Sonde nasogastrique' },
      { label: 'Drain de Redon (CH12-16)', variantes: ['CH12', 'CH14', 'CH16'] },
      { label: 'Sonde vésicale (CH8-22)', variantes: ['CH8', 'CH10', 'CH12', 'CH14', 'CH16', 'CH18', 'CH20', 'CH22'] },
      { label: 'Poche à urine' },
    ],
  }, // 17
  CONSOMMABLES: {
    titre: 'Consommables',
    accent: 'secondary',
    icon: 'inventory_2',
    items: [
      { label: 'Coton' },
      { label: 'Alcool' },
      { label: 'Sparadrap standard 70cm' },
      { label: 'Dakin Cooper stabilisé' },
      { label: 'Bétadine jaune' },
      { label: 'Bétadine rouge' },
      { label: 'Seringue 50cc' },
      { label: 'Seringue 20cc' },
      { label: 'Seringue 10cc' },
      { label: 'Seringue 5cc' },
      { label: 'Sécurefix PM/GM', variantes: ['PM', 'GM'] },
      { label: 'Lunettes nasales' },
      { label: 'Lunettes nasales enfant' },
      { label: 'Kit AG' },
      { label: 'Kit ALR' },
    ],
  }, // 15
}
// Total réel : 7+14+7+9+8+17+15 = 77

export const TOTAL_MEDICAMENTS = Object.values(CATALOGUE_MEDICAMENTS).reduce(
  (total, categorie) => total + categorie.items.length,
  0,
)
