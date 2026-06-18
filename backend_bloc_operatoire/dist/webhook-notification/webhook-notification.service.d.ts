import { Repository } from 'typeorm';
import { WebhookNotification } from '../entities/webhook-notification.entity';
export declare class WebhookNotificationService {
    private readonly webhookRepo;
    private readonly logger;
    constructor(webhookRepo: Repository<WebhookNotification>);
    processIncomingNotification(payload: any, sourceService?: string): Promise<boolean>;
    getUnreadCount(): Promise<number>;
}
