export enum RoleClinique {
  RESPONSABLE_CPA = 'RESPONSABLE_CPA',
  ANESTHESISTE = 'ANESTHESISTE',
  CHIRURGIEN = 'CHIRURGIEN',
  IBODE = 'IBODE',
  MAJOR = 'MAJOR',
}

const DIACRITIQUES = new RegExp('[\\u0300-\\u036f]', 'g');

// Fait correspondre le nom de rôle défini côté SSO central (auth-service, libellé libre créé
// dans son panneau d'admin) à l'un des 5 rôles cliniques du bloc opératoire. Correspondance par
// mot-clé (insensible à la casse/accents) plutôt qu'égalité stricte, car on ne maîtrise pas
// l'orthographe exacte saisie côté admin central.
export function matchRoleClinique(
  roleName: string | undefined | null,
): RoleClinique | null {
  if (!roleName) return null;
  const normalise = roleName
    .normalize('NFD')
    .replace(DIACRITIQUES, '')
    .toLowerCase();

  if (normalise.includes('responsable') && normalise.includes('cpa'))
    return RoleClinique.RESPONSABLE_CPA;
  if (normalise.includes('anesthesist')) return RoleClinique.ANESTHESISTE;
  if (normalise.includes('chirurgien')) return RoleClinique.CHIRURGIEN;
  if (normalise.includes('ibode')) return RoleClinique.IBODE;
  if (normalise.includes('major')) return RoleClinique.MAJOR;
  return null;
}

// Le Major remplace totalement l'anesthésiste (même rôle clinique, décision validée) : tout ce
// qui est réservé à l'anesthésiste est aussi accessible au Major. Garde-fou de traçabilité : on
// conserve l'identité MAJOR pour l'attribution/affichage, on n'élève jamais le rôle en
// ANESTHESISTE.
export function agitCommeAnesthesiste(
  role: RoleClinique | null | undefined,
): boolean {
  return (
    role === RoleClinique.ANESTHESISTE || role === RoleClinique.MAJOR
  );
}
