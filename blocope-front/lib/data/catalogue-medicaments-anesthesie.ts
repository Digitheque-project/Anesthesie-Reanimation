import type { MedicamentTableAccent } from '@/components/bloc/medicaments-anesthesie/MedicamentTable'

// Source : liste fournie par le service (remplace l'ancien catalogue à 7 catégories/77
// articles, reconstitué depuis une fiche papier scannée — celui-ci est la version officielle).

export type CategorieMedicament =
  | 'SERUM'
  | 'PRODUITS_ANESTHESIQUES'
  | 'ANTALGIQUES'
  | 'ANTIBIOTIQUES_AUTRES'
  | 'CONSOMMABLES'

export type CategorieMedicamentDef = {
  titre: string
  accent: MedicamentTableAccent
  icon: string
  items: string[]
}

export const CATALOGUE_MEDICAMENTS: Record<CategorieMedicament, CategorieMedicamentDef> = {
  SERUM: {
    titre: 'Sérum',
    accent: 'primary',
    icon: 'water_drop',
    items: [
      'SGH 5% (500 ml – 1000 ml)',
      'SSI 9% (500 ml – 1000 ml)',
      'RL (500 ml – 1000 ml)',
      'Hestar (500 ml)',
      'DNS (500 ml)',
      'Mannitol 20% (100 ml à 500 ml)',
      'Sérum composé (500 ml)',
    ],
  }, // 7
  PRODUITS_ANESTHESIQUES: {
    titre: 'Produits anesthésiques',
    accent: 'secondary',
    icon: 'vaccines',
    items: [
      'Fentanyl (100 – 500)',
      'Propofol Lipuro 1% (20 ml)',
      'Atropine (0,5 mg – 0,25 mg)',
      'Aratax 100 mg inj',
      'Sévoflurane (50 ml, 100 ml, 150 ml…)',
    ],
  }, // 5
  ANTALGIQUES: {
    titre: 'Antalgiques',
    accent: 'tertiary',
    icon: 'medication',
    items: [
      'Perfalgan (500 mg – 1000 mg)',
      'Doliprane suppo (100 mg, 150 mg, 200 mg, 300 mg, 1000 mg)',
      'Profénid (100 mg inj – suppo)',
      'Nifluril (400 mg inj – suppo)',
      'Tramadol (100 mg inj)',
      'Acupan (20 mg inj)',
    ],
  }, // 6
  ANTIBIOTIQUES_AUTRES: {
    titre: 'Antibiotiques & autres',
    accent: 'error',
    icon: 'biotech',
    items: [
      'Flagyl 500 mg perf',
      'Céfuroxime 1,5 g',
      'Héparine (Lovenox 0,2 – 0,4 – 0,6)',
      'Méthylprednisolone (40 mg – 120 mg)',
      'Loxen 10 mg inj',
      'Calcium 1 g inj',
      'Nitriderm 10 mg',
      'Cathéter veineux (24G – 22G – 20G – 18G – 16G)',
      'Aiguille PL (22, 25…)',
      'Sonde d\'intubation (CH3, CH3.5… CH8)',
      'Canule de Guedel (N°00-3)',
      'Sonde d\'aspiration (CH14-6)',
      'Drain de Redon (CH12-16)',
      'Sonde vésicale (CH8-22)',
    ],
  }, // 14
  CONSOMMABLES: {
    titre: 'Consommables',
    accent: 'inverse-primary',
    icon: 'inventory_2',
    items: [
      'Dakin Cooper stabilisé (250 cc – 500 cc)',
    ],
  }, // 1
}
// Total : 7+5+6+14+1 = 33

export const TOTAL_MEDICAMENTS = Object.values(CATALOGUE_MEDICAMENTS).reduce(
  (total, categorie) => total + categorie.items.length,
  0,
)
