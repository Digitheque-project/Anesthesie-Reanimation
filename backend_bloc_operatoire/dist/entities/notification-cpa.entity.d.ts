import { Medecin } from './medecin.entity';
export declare enum StatutNotificationCPA {
    EN_ATTENTE = "EN_ATTENTE",
    RDV_PLANIFIE = "RDV_PLANIFIE",
    REALISE = "REALISE"
}
export declare class NotificationCPA {
    id: string;
    heurePrescription: string;
    patientId: string;
    intervention: string;
    chirurgien: Medecin;
    chirurgienId: string;
    professeurCPA: string;
    estUrgent: boolean;
    statut: StatutNotificationCPA;
    createdAt: Date;
    updatedAt: Date;
}
