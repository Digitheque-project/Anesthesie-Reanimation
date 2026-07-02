import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { DemandeCpaExterne } from '../entities/demande-cpa-externe.entity';
export declare class EndoscopieClient {
    private readonly http;
    private readonly config;
    private readonly logger;
    private readonly baseUrl;
    private readonly serviceId;
    private readonly blocServiceId;
    constructor(http: HttpService, config: ConfigService);
    private notify;
    notifyCpaResultat(demande: DemandeCpaExterne, decision: string, details: {
        dateCpa?: Date;
        observations?: string;
    }): Promise<void>;
    notifyVpaRealisee(demande: DemandeCpaExterne, details: {
        dateVpa?: Date;
    }): Promise<void>;
}
