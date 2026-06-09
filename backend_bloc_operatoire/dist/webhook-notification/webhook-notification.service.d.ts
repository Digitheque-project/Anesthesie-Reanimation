import { Repository } from 'typeorm';
import { NotificationCPA } from '../entities/notification-cpa.entity';
export declare class WebhookNotificationService {
    private readonly notificationRepo;
    private readonly logger;
    constructor(notificationRepo: Repository<NotificationCPA>);
    processIncomingNotification(payload: any, sourceService?: string): Promise<boolean>;
}
