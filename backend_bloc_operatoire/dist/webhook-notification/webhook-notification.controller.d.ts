import { WebhookNotificationService } from './webhook-notification.service';
export declare class WebhookNotificationController {
    private readonly service;
    private readonly logger;
    constructor(service: WebhookNotificationService);
    receivePost(payload: any, source?: string): Promise<{
        received: boolean;
        processed: boolean;
        method: string;
        timestamp: string;
    }>;
    getUnreadCount(): Promise<{
        unread: number;
    }>;
}
