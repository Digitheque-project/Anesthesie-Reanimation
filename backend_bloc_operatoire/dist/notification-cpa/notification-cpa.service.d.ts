import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { NotificationCPA } from '../entities/notification-cpa.entity';
import { WebhookNotification } from '../entities/webhook-notification.entity';
<<<<<<< HEAD
import { PatientBloc } from '../entities/patient-bloc.entity';
import { CreneauBloc } from '../entities/creneau-bloc.entity';
=======
import { PatientBloc, PatientStatut } from '../entities/patient-bloc.entity';
>>>>>>> a733407 (commit 1508)
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
        data: any[];
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
