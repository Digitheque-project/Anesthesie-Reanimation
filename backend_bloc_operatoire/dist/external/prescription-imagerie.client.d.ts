import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
export interface PrescriptionImagerieExterne {
    id: string;
    patientId: string;
    prescripteurId: string;
    urgence: string;
    alertes?: string | null;
    renseignements?: string | null;
    notes?: string | null;
    chuId?: string | null;
    serviceIdSource?: string | null;
    serviceIdDest?: string | null;
    type?: string | null;
    precisions?: string | null;
    prescripteurExterne?: boolean;
    prescripteurNomManuel?: string | null;
    prescripteurPrenomManuel?: string | null;
    statut: string;
    createdAt: string;
    updatedAt: string;
}
export declare class PrescriptionImagerieClient {
    private readonly http;
    private readonly config;
    private readonly logger;
    private readonly baseUrl;
    constructor(http: HttpService, config: ConfigService);
    getParPatient(patientId: string): Promise<PrescriptionImagerieExterne[]>;
    getParId(id: string): Promise<PrescriptionImagerieExterne | null>;
}
