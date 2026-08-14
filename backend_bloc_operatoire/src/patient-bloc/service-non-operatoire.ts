// Distingue les patients du Programme opératoire (chirurgie classique, ex: Pédiatrie, Unité
// Chirurgicale) de ceux du Programme non-opératoire (venus d'un service qui n'opère pas au
// Bloc — Imagerie/scanner, Endoscopie, Urgence — pour qui l'anesthésiste du Bloc se déplace,
// avec les mêmes checklists). Correspondance par mot-clé (insensible à la casse/accents) sur
// `serviceOrigine`, comme côté frontend (voir lib/programme-non-operatoire.ts) et pour les rôles
// cliniques (role-clinique.ts) : on ne maîtrise pas l'orthographe exacte du nom de service tel
// qu'enregistré côté SSO central.
const DIACRITIQUES = new RegExp('[\\u0300-\\u036f]', 'g');

function normaliser(valeur: string): string {
  return valeur.normalize('NFD').replace(DIACRITIQUES, '').toLowerCase();
}

// Mots-clés lus dans la configuration, séparés par des virgules — un CHU peut ainsi déclarer un
// service non-opératoire supplémentaire (ou renommé localement) sans modification du code.
function motsClesConfigures(variable: string): string[] {
  return (process.env[variable] ?? '')
    .split(',')
    .map((mot) => normaliser(mot.trim()))
    .filter((mot) => mot !== '');
}

// La correspondance se fait sur le NOM du service, dont on ne maîtrise pas l'orthographe côté SSO
// central : la liste couvre donc aussi les dénominations courantes du même service. "radiologie",
// "irm", "tdm"/"tomodensitometrie" et "echographie" désignent le même plateau technique
// qu'"imagerie"/"scanner" — un CHU qui enregistre son service sous "Radiologie" voyait sinon ses
// patients basculer dans le Programme OPÉRATOIRE et passer par la salle de réveil du Bloc alors
// que le service possède la sienne.
const MOTS_CLES_NON_OPERATOIRE = [
  'imagerie',
  'radiologie',
  'scanner',
  'tomodensitometrie',
  'tdm',
  'irm',
  'echographie',
  'endoscopie',
  'urgence',
];

export function estServiceNonOperatoire(
  serviceOrigine?: string | null,
): boolean {
  if (!serviceOrigine) return false;
  const normalise = normaliser(serviceOrigine);
  return [
    ...MOTS_CLES_NON_OPERATOIRE,
    ...motsClesConfigures('SERVICES_NON_OPERATOIRES'),
  ].some((mot) => normalise.includes(mot));
}

// Décision post-acte : le patient doit-il repartir dans son service d'origine (qui possède sa
// propre salle de réveil) au lieu d'être surveillé en salle de réveil du Bloc ?
// - Imagerie/Scanner : le service d'origine possède sa propre salle de réveil → retour service +
//   archivage (SORTI) après l'acte anesthésique, sans passer par la salle de réveil du Bloc.
// - Endoscopie et Urgence : c'est le même anesthésiste du Bloc qui surveille le patient →
//   ils suivent désormais le flux complet de la chirurgie (transfert en salle de réveil du Bloc,
//   surveillance, sortie), comme les patients opérés.
const MOTS_CLES_PROPRE_SALLE_REVEIL = [
  'imagerie',
  'radiologie',
  'scanner',
  'tomodensitometrie',
  'tdm',
  'irm',
];

export function aSaPropreSalleDeReveil(
  serviceOrigine?: string | null,
): boolean {
  if (!serviceOrigine) return false;
  const normalise = normaliser(serviceOrigine);
  return [
    ...MOTS_CLES_PROPRE_SALLE_REVEIL,
    ...motsClesConfigures('SERVICES_AVEC_SALLE_REVEIL'),
  ].some((mot) => normalise.includes(mot));
}
