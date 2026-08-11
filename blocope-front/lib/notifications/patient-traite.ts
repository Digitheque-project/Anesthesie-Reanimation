// Un patient dont la CPA a déjà été traitée — validée (CPA_REALISE), inapte, ou plus avancé dans
// le parcours (vérification veille, prêt pour bloc, opération, réveil, sortie) — ne doit plus
// apparaître dans les listes "à traiter" (fil Prescription, tableau de bord...), même comportement
// que la cloche qui retire les notifications lues. Le flag cpaFinaleRealisee (porté par le backend
// depuis la dernière CPA du patient, APTE/INAPTE hors opération reportée) couvre le cas où le
// PatientBloc est absent ou resté en EN_ATTENTE_CPA alors que la CPA a pourtant été tranchée.
export const STATUTS_PATIENT_TRAITES = new Set([
  'CPA_REALISE',
  'CPA_INAPTE',
  'EN_ATTENTE_VERIFICATION_VEILLE',
  'VERIFICATION_VEILLE_REALISEE',
  'PRET_POUR_BLOC',
  'EN_COURS_OPERATION',
  'EN_SALLE_REVEIL',
  'SORTI',
])

export function estPatientTraite(n: {
  patient?: { statut?: string } | null
  cpaFinaleRealisee?: boolean
}): boolean {
  const statutPatient = n.patient?.statut
  if (statutPatient && STATUTS_PATIENT_TRAITES.has(statutPatient)) return true
  if (n.cpaFinaleRealisee) return true
  return false
}
