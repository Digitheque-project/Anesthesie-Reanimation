import { CPA } from './cpa.entity';
export declare enum StatutVerificationVeille {
    EN_ATTENTE = "EN_ATTENTE",
    VALIDE = "VALIDE"
}
export declare class VerificationVeille {
    id: string;
    patientId: string;
    cpa: CPA;
    cpaId: string;
    anesthesisteId: string;
    dateVisite: Date;
    identiteConfirmee: boolean;
    jeuneRespected: boolean;
    instructionsRespectees: boolean;
    premedicationFaite: boolean;
    jeune: string;
    examensComplementaires: string;
    commandeSang: any;
    medicamentsVerifies: string[] | null;
    heureDepart: string;
    statut: StatutVerificationVeille;
    createdAt: Date;
    updatedAt: Date;
}
