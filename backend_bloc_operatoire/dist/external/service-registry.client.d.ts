import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { ServiceTokenService } from '../central-auth/service-token.service';
export declare class ServiceRegistryClient {
    private readonly http;
    private readonly config;
    private readonly serviceToken;
    private readonly logger;
    private readonly baseUrl;
    private readonly cache;
    private readonly cacheDureeMs;
    constructor(http: HttpService, config: ConfigService, serviceToken: ServiceTokenService);
    private authHeaders;
    getServiceName(id: string | null | undefined): Promise<string | null>;
}
