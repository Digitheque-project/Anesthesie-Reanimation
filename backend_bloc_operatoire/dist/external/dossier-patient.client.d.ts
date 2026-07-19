import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
export declare class DossierPatientClient {
    private readonly http;
    private readonly config;
    private readonly logger;
    private readonly baseUrl;
    private readonly chuId;
    private readonly serviceId;
    constructor(http: HttpService, config: ConfigService);
    private get;
    private getParPatient;
    getAntecedentsActifs(patientId: string, token: string): Promise<any[]>;
    getDiagnostics(patientId: string, token: string): Promise<any[]>;
    getHistoriqueMaladieRecente(patientId: string, token: string): Promise<any[]>;
    getHistoriquesUrgents(patientId: string, token: string): Promise<any[]>;
    getDernierExamenPhysique(patientId: string, token: string): Promise<any[]>;
    getExamensComplementairesUrgents(patientId: string, token: string): Promise<any[]>;
    getSuivis(patientId: string, token: string): Promise<any[]>;
}
