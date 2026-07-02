import { CPA } from './cpa.entity';
import { Medecin } from './medecin.entity';
export declare enum StatutVPA {
    EN_ATTENTE = "EN_ATTENTE",
    VALIDE = "VALIDE"
}
export declare class VPA {
    id: string;
    patientId: string;
    cpa: CPA;
    cpaId: string;
    anesthesiste: Medecin;
    anesthesisteId: string;
    dateVisite: Date;
    identiteConfirmee: boolean;
    jeuneRespected: boolean;
    instructionsRespectees: boolean;
    premedicationFaite: boolean;
    jeune: string;
    examensComplementaires: string;
    commandeSang: any;
    heureDepart: string;
    statut: StatutVPA;
    createdAt: Date;
    updatedAt: Date;
}
