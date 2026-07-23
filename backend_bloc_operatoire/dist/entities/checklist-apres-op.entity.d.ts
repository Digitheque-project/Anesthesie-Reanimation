export declare enum StatutChecklist {
    EN_COURS = "EN_COURS",
    VALIDE = "VALIDE"
}
export declare class ChecklistApresOp {
    id: string;
    patientId: string;
    dateCreation: Date;
    interventionEnregistree: boolean;
    compteFinalCorrect: boolean;
    etiquetageVerifie: boolean;
    signalementsEffectues: boolean;
    transfertSalleReveil: boolean;
    observationsParticulieres: string;
    statut: StatutChecklist;
    validateurId: string | null;
    validateurNom: string | null;
    validateurRole: string | null;
    createdAt: Date;
    updatedAt: Date;
}
