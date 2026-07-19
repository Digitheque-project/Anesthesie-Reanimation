import { StatutVerificationVeille } from '../../entities/verification-veille.entity';
export declare class CreateVerificationVeilleDto {
    patientId: string;
    cpaId: string;
    anesthesisteId?: string;
    dateVisite: string;
    identiteConfirmee: boolean;
    jeuneRespected: boolean;
    instructionsRespectees: boolean;
    premedicationFaite: boolean;
    jeune: string;
    examensComplementaires: string;
    commandeSang?: any;
    heureDepart: string;
    statut?: StatutVerificationVeille;
}
