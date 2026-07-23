import { Medecin } from './medecin.entity';
export declare enum StatutNotificationCPA {
    EN_ATTENTE = "EN_ATTENTE",
    RDV_PLANIFIE = "RDV_PLANIFIE",
    REALISE = "REALISE"
}
export declare class NotificationCPA {
    id: string;
    heurePrescription: string;
    dateIntervention: Date | null;
    patientId: string;
    intervention: string;
    chirurgien: Medecin | null;
    chirurgienId: string | null;
    chirurgienNom: string | null;
    professeurCPA: string | null;
    estUrgent: boolean;
    statut: StatutNotificationCPA;
    createdAt: Date;
    updatedAt: Date;
}
