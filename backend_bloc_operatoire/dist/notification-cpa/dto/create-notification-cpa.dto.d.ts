import { StatutNotificationCPA } from '../../entities/notification-cpa.entity';
export declare class CreateNotificationCPADto {
    heurePrescription: string;
    dateIntervention?: string;
    patientId: string;
    intervention: string;
    chirurgienId: string;
    professeurCPA: string;
    estUrgent: boolean;
    statut?: StatutNotificationCPA;
}
