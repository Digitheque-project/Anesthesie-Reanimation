export declare enum StatutChecklist {
    EN_COURS = "EN_COURS",
    VALIDE = "VALIDE"
}
export declare class ChecklistPendantOp {
    id: string;
    patientId: string;
    dateCreation: Date;
    identiteUltimeConfirmee: boolean;
    interventionConfirmee: boolean;
    siteOperatoireConfirme: boolean;
    installationCorrecte: boolean;
    documentsDisponibles: boolean;
    antibioprophylaxieFaite: boolean;
    constantesStables: boolean;
    ventilationOK: boolean;
    statut: StatutChecklist;
    validateurId: string | null;
    validateurNom: string | null;
    validateurRole: string | null;
    createdAt: Date;
    updatedAt: Date;
}
