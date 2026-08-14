import { NiveauUrgence } from '../entities/patient-bloc.entity';

// Échelle d'urgence unique pour TOUS les canaux d'arrivée (prescription bloc, prescription
// imagerie, demande de CPA externe, webhook générique). Elle existait auparavant en trois
// versions incompatibles, ce qui rendait le degré d'urgence d'un même patient différent selon la
// porte d'entrée :
//   - PatientBlocService.creerDepuisPrescription : urgence >= 3 -> TRES_URGENT, sinon NORMAL
//     (aucun patient n'atteignait jamais URGENT) ;
//   - DemandeCpaExterneService : urgence >= 4 -> notification "urgente" et créneau d'urgence ;
//   - frontend : urgence === 3 -> patient traité comme STAT.
// Un patient transmis en urgence 3 par Endoscopie était donc TRES_URGENT dans sa fiche, mais sa
// notification et son créneau n'étaient PAS marqués urgents.
//
// Convention retenue (celle des services demandeurs, 1 = faible ... 5 = immédiat) :
//   1-2 -> NORMAL   3-4 -> URGENT   5 -> TRES_URGENT
// URGENT et TRES_URGENT déclenchent exactement le même parcours (pas de vérification veille,
// bascule directe vers le programme du jour — voir CPAService.create) ; seule la lisibilité de
// l'affichage les distingue.
export function niveauDepuisEchelle(
  urgence?: number | null,
): NiveauUrgence {
  const valeur = Number(urgence);
  if (!Number.isFinite(valeur)) return NiveauUrgence.NORMAL;
  if (valeur >= 5) return NiveauUrgence.TRES_URGENT;
  if (valeur >= 3) return NiveauUrgence.URGENT;
  return NiveauUrgence.NORMAL;
}

// Vocabulaire textuel utilisé par les services de prescription (bloc et imagerie). 'STAT' et
// 'URGENTE' restent acceptés pour d'anciens payloads ou d'autres sources ; un service qui
// transmettrait un chiffre ('4') plutôt qu'un libellé est également géré, pour ne jamais
// dégrader silencieusement une urgence en NORMAL faute de vocabulaire commun.
export function niveauDepuisLibelle(
  urgence?: string | number | null,
): NiveauUrgence {
  if (typeof urgence === 'number') return niveauDepuisEchelle(urgence);
  const u = String(urgence ?? '')
    .trim()
    .toUpperCase();
  if (u === '') return NiveauUrgence.NORMAL;
  if (/^\d+$/.test(u)) return niveauDepuisEchelle(Number(u));
  if (u === 'TRES_URGENT' || u === 'TRÈS_URGENT' || u === 'STAT')
    return NiveauUrgence.TRES_URGENT;
  if (u === 'URGENT' || u === 'URGENTE' || u === 'URGENCE')
    return NiveauUrgence.URGENT;
  return NiveauUrgence.NORMAL;
}

// Un niveau "urgent" au sens des badges, sons et créneaux d'urgence : tout sauf NORMAL.
export function estNiveauUrgent(niveau: NiveauUrgence): boolean {
  return niveau !== NiveauUrgence.NORMAL;
}

// Ensemble des niveaux considérés comme urgents — pour les requêtes qui doivent tous les
// remonter (alertes, tableaux de bord) sans oublier TRES_URGENT.
export const NIVEAUX_URGENTS: NiveauUrgence[] = [
  NiveauUrgence.URGENT,
  NiveauUrgence.TRES_URGENT,
];
