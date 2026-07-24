import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { ServiceTokenService } from '../central-auth/service-token.service';
export interface IdentiteCentrale {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string | null;
    matricule?: string | null;
    numeroOrdre?: string | null;
    ordre?: string | null;
}
export declare class CentralUserClient {
    private readonly http;
    private readonly config;
    private readonly serviceToken;
    private readonly logger;
    private readonly baseUrl;
    constructor(http: HttpService, config: ConfigService, serviceToken: ServiceTokenService);
    private authHeaders;
    private normaliser;
    getUser(id: string): Promise<IdentiteCentrale | null>;
    getUsers(ids: string[]): Promise<Record<string, IdentiteCentrale>>;
}
