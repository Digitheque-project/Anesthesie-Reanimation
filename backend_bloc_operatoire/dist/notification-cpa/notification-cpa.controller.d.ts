import { NotificationCPAService } from './notification-cpa.service';
import { CreateNotificationCPADto } from './dto/create-notification-cpa.dto';
import { UpdateNotificationCPADto } from './dto/update-notification-cpa.dto';
export declare class NotificationCPAController {
    private readonly service;
    constructor(service: NotificationCPAService);
    create(d: CreateNotificationCPADto): Promise<import("../entities").NotificationCPA>;
    findAll(p?: number, l?: number): Promise<{
        data: (import("../entities").WebhookNotification | (import("../entities").NotificationCPA & {
            patient: import("../external/dto/external-patient.dto").ExternalPatient | null;
        }))[];
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
