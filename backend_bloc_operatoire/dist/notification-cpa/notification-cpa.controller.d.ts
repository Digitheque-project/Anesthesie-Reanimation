import { NotificationCPAService } from './notification-cpa.service';
import { CreateNotificationCPADto } from './dto/create-notification-cpa.dto';
import { UpdateNotificationCPADto } from './dto/update-notification-cpa.dto';
export declare class NotificationCPAController {
    private readonly service;
    constructor(service: NotificationCPAService);
    create(d: CreateNotificationCPADto): Promise<import("../entities").NotificationCPA>;
    findAll(p?: number, l?: number): Promise<{
        data: (import("../entities").WebhookNotification | {
            chirurgien: any;
            patient: {
                id: string;
                nom: any;
                prenom: any;
                idDossier: any;
                statut: import("../entities").PatientStatut | undefined;
                niveauUrgence: import("../entities").NiveauUrgence | undefined;
            };
            id: string;
            heurePrescription: string;
            dateIntervention: Date | null;
            patientId: string;
            intervention: string;
            chirurgienId: string | null;
            chirurgienNom: string | null;
            professeurCPA: string | null;
            estUrgent: boolean;
            statut: import("../entities").StatutNotificationCPA;
            createdAt: Date;
            updatedAt: Date;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
    getUnreadCount(): Promise<{
        unread: number;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, d: UpdateNotificationCPADto): Promise<import("../entities").NotificationCPA>;
    planifier(id: string, dto: any): Promise<import("../entities").NotificationCPA>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
