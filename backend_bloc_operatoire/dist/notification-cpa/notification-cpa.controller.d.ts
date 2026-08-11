import { NotificationCPAService } from './notification-cpa.service';
import { CreateNotificationCPADto } from './dto/create-notification-cpa.dto';
import { UpdateNotificationCPADto } from './dto/update-notification-cpa.dto';
export declare class NotificationCPAController {
    private readonly service;
    constructor(service: NotificationCPAService);
    create(d: CreateNotificationCPADto): Promise<import("../entities").NotificationCPA>;
    findAll(p?: number, l?: number): Promise<{
        data: ({
            chirurgien: any;
            patient: {
                id: string;
                nom: any;
                prenom: any;
                idDossier: any;
                statut: import("../entities").PatientStatut | undefined;
                niveauUrgence: import("../entities").NiveauUrgence | undefined;
                dateIntervention: Date | null;
            };
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
            statut: import("../entities").StatutNotificationCPA;
            lu: boolean;
            luLe: Date | null;
            createdAt: Date;
            updatedAt: Date;
        } | {
            patient: {
                id: string;
                statut: import("../entities").PatientStatut;
                niveauUrgence: import("../entities").NiveauUrgence;
                dateIntervention: Date;
            } | undefined;
            id: string;
            type: string;
            motif: string;
            patientId: string;
            sourceServiceId: string;
            sourceServiceName: string;
            targetServiceId: string;
            targetServiceName: string;
            urgence: number;
            payload: any;
            channels: string[];
            processed: boolean;
            receivedAt: Date;
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
    marquerLu(id: string): Promise<import("../entities").NotificationCPA>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
