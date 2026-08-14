// Numéro de dossier local au Bloc. `PatientBloc.idDossier` porte une contrainte d'unicité en
// base : le `CHU-${Date.now()}` utilisé jusqu'ici à deux endroits (création depuis une demande de
// CPA externe, ingestion d'une prescription imagerie) produisait la MÊME valeur pour deux
// patients créés dans la même milliseconde — ce qui arrive dès qu'un service pousse plusieurs
// patients d'un coup, ou qu'un cycle de polling en ingère plusieurs à la suite : l'insertion du
// second échouait sur violation d'unicité et le patient n'entrait jamais dans le bloc.
// Un identifiant dérivé du patient est unique par construction, stable d'un épisode à l'autre, et
// lisible dans les listes.
const LONGUEUR_MAX = 50; // voir @Column({ length: 50 }) sur PatientBloc.idDossier

export function construireIdDossier(patientId: string): string {
  const base = `CHU-${String(patientId ?? '').trim()}`;
  return base.length > LONGUEUR_MAX ? base.slice(0, LONGUEUR_MAX) : base;
}
