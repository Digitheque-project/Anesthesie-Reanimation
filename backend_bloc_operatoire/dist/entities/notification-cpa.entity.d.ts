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
    chirurgienId: string | null;
    chirurgienNom: string | null;
    professeurCPA: string | null;
    serviceSourceId: string | null;
    serviceSourceNom: string | null;
    estUrgent: boolean;
    statut: StatutNotificationCPA;
    lu: boolean;
    luLe: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
