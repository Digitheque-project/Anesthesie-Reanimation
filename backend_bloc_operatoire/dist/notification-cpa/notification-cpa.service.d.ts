import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { NotificationCPA, StatutNotificationCPA } from '../entities/notification-cpa.entity';
import { WebhookNotification } from '../entities/webhook-notification.entity';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { AccueilClient } from '../external/accueil.client';
import { MedecinIdentiteService } from '../medecin/medecin-identite.service';
import { NotificationOutgoingService } from '../external/notification-outgoing.service';
import { NotificationBackClient } from '../external/notification-back.client';
import { CreateNotificationCPADto } from './dto/create-notification-cpa.dto';
import { UpdateNotificationCPADto } from './dto/update-notification-cpa.dto';
export declare class NotificationCPAService {
    private readonly notificationRepo;
    private readonly webhookRepo;
    private readonly patientBlocRepo;
    private accueilClient;
    private medecinIdentiteService;
    private notificationOutgoing;
    private notificationBackClient;
    private config;
    private readonly logger;
    private readonly blocServiceId;
    constructor(notificationRepo: Repository<NotificationCPA>, webhookRepo: Repository<WebhookNotification>, patientBlocRepo: Repository<PatientBloc>, accueilClient: AccueilClient, medecinIdentiteService: MedecinIdentiteService, notificationOutgoing: NotificationOutgoingService, notificationBackClient: NotificationBackClient, config: ConfigService);
    create(dto: CreateNotificationCPADto): Promise<NotificationCPA>;
    findAll(page?: number, limite?: number): Promise<{
        data: (WebhookNotification | {
            chirurgien: any;
            patient: {
                id: string;
                nom: any;
                prenom: any;
                idDossier: any;
                statut: import("../entities/patient-bloc.entity").PatientStatut | undefined;
                niveauUrgence: import("../entities/patient-bloc.entity").NiveauUrgence | undefined;
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
            statut: StatutNotificationCPA;
            lu: boolean;
            luLe: Date | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
    findOne(id: string): Promise<any>;
    planifierRDV(id: string, dto: any): Promise<NotificationCPA>;
    update(id: string, dto: UpdateNotificationCPADto): Promise<NotificationCPA>;
    marquerLu(id: string): Promise<NotificationCPA>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getUnreadCount(): Promise<number>;
}
