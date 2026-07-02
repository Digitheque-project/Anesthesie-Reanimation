import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
export declare class ServiceChuClient {
    private readonly http;
    private readonly config;
    private readonly logger;
    private readonly baseUrl;
    private readonly chuId;
    private readonly serviceId;
    constructor(http: HttpService, config: ConfigService);
    getChu(id?: string): Promise<any>;
    getService(id?: string): Promise<any>;
}
