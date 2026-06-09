import { WebhookNotificationService } from './webhook-notification.service';
import { ReceiveNotificationDto } from './dto/receive-notification.dto';
export declare class WebhookNotificationController {
    private readonly service;
    private readonly logger;
    constructor(service: WebhookNotificationService);
    receivePost(payload: ReceiveNotificationDto, source?: string): Promise<{
        received: boolean;
        processed: boolean;
        method: string;
        timestamp: string;
    }>;
    receiveGet(type: string, targetId: string, message: string, source?: string): Promise<{
        received: boolean;
        processed: boolean;
        method: string;
        timestamp: string;
    }>;
}
