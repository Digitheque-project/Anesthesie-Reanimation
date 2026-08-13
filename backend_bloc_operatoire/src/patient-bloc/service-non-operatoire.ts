// Distingue les patients du Programme opératoire (chirurgie classique, ex: Pédiatrie, Unité
// Chirurgicale) de ceux du Programme non-opératoire (venus d'un service qui n'opère pas au
// Bloc — Imagerie/scanner, Endoscopie, Urgence — pour qui l'anesthésiste du Bloc se déplace,
// avec les mêmes checklists). Correspondance par mot-clé (insensible à la casse/accents) sur
// `serviceOrigine`, comme côté frontend (voir lib/programme-non-operatoire.ts) et pour les rôles
// cliniques (role-clinique.ts) : on ne maîtrise pas l'orthographe exacte du nom de service tel
// qu'enregistré côté SSO central.
const DIACRITIQUES = new RegExp('[\\u0300-\\u036f]', 'g');

const MOTS_CLES_NON_OPERATOIRE = [
  'imagerie',
  'scanner',
  'endoscopie',
  'urgence',
];

export function estServiceNonOperatoire(
  serviceOrigine?: string | null,
): boolean {
  if (!serviceOrigine) return false;
  const normalise = serviceOrigine
    .normalize('NFD')
    .replace(DIACRITIQUES, '')
    .toLowerCase();
  return MOTS_CLES_NON_OPERATOIRE.some((mot) => normalise.includes(mot));
}

// Décision post-acte : le patient doit-il repartir dans son service d'origine (qui possède sa
// propre salle de réveil) au lieu d'être surveillé en salle de réveil du Bloc ?
// - Imagerie/Scanner : le service d'origine possède sa propre salle de réveil → retour service +
//   archivage (SORTI) après l'acte anesthésique, sans passer par la salle de réveil du Bloc.
// - Endoscopie et Urgence : c'est le même anesthésiste du Bloc qui surveille le patient →
//   ils suivent désormais le flux complet de la chirurgie (transfert en salle de réveil du Bloc,
//   surveillance, sortie), comme les patients opérés.
const MOTS_CLES_PROPRE_SALLE_REVEIL = ['imagerie', 'scanner'];

export function aSaPropreSalleDeReveil(
  serviceOrigine?: string | null,
): boolean {
  if (!serviceOrigine) return false;
  const normalise = serviceOrigine
    .normalize('NFD')
    .replace(DIACRITIQUES, '')
    .toLowerCase();
  return MOTS_CLES_PROPRE_SALLE_REVEIL.some((mot) => normalise.includes(mot));
}
