import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
export declare class NotificationBackClient {
    private readonly http;
    private readonly config;
    private readonly logger;
    private readonly baseUrl;
    constructor(http: HttpService, config: ConfigService);
    notifyService(params: {
        serviceId: string;
        title: string;
        message: string;
        type: string;
        source: string;
        data?: Record<string, unknown>;
    }): Promise<void>;
}
