export declare enum StatutChecklist {
    EN_COURS = "EN_COURS",
    VALIDE = "VALIDE"
}
export declare class ChecklistAvantOp {
    id: string;
    patientId: string;
    dateCreation: Date;
    identiteConfirmee: boolean;
    interventionSiteConfirmes: boolean;
    documentationDisponible: boolean;
    installationConnue: boolean;
    materielChirurgicalVerifie: boolean;
    materielAnesthesiqueVerifie: boolean;
    allergiePatient: boolean;
    risqueIntubation: boolean;
    risqueSaignement: boolean;
    identiteConfirmeeUltime: boolean;
    interventionConfirmeeUltime: boolean;
    antibioprophylaxieFaite: boolean;
    notesChirurgicales: string;
    notesAnesthesiques: string;
    notesIdeIbode: string;
    statut: StatutChecklist;
    validateurId: string | null;
    validateurNom: string | null;
    validateurRole: string | null;
    createdAt: Date;
    updatedAt: Date;
}
