import { Repository } from 'typeorm';
import { NotificationCPA } from '../entities/notification-cpa.entity';
import { WebhookNotification } from '../entities/webhook-notification.entity';
import { AccueilClient } from '../external/accueil.client';
import { CreateNotificationCPADto } from './dto/create-notification-cpa.dto';
import { UpdateNotificationCPADto } from './dto/update-notification-cpa.dto';
export declare class NotificationCPAService {
    private readonly notificationRepo;
    private readonly webhookRepo;
    private accueilClient;
    constructor(notificationRepo: Repository<NotificationCPA>, webhookRepo: Repository<WebhookNotification>, accueilClient: AccueilClient);
    create(dto: CreateNotificationCPADto): Promise<NotificationCPA>;
    findAll(page?: number, limite?: number): Promise<{
        data: (WebhookNotification | (NotificationCPA & {
            patient: import("../external/dto/external-patient.dto").ExternalPatient | null;
        }))[];
        total: number;
        page: number;
        pages: number;
    }>;
    findOne(id: string): Promise<any>;
    planifierRDV(id: string, dto: any): Promise<NotificationCPA>;
    update(id: string, dto: UpdateNotificationCPADto): Promise<NotificationCPA>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getUnreadCount(): Promise<number>;
}
