import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
export declare class NotificationOutgoingService {
    private readonly http;
    private readonly config;
    private readonly logger;
    private readonly blocServiceId;
    constructor(http: HttpService, config: ConfigService);
    notifyOriginService(params: {
        patientId: string;
        type: string;
        serviceOrigineId: string;
        serviceOrigineName: string;
        payload: any;
        notificationUrl?: string;
    }): Promise<void>;
}
