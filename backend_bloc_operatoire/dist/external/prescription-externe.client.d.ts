import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
export interface ActeBlocExterne {
    id: string;
    libelle: string;
    cote?: string | null;
    typeChirurgie?: string | null;
    risqueHemorragique?: string | null;
}
export interface PrescriptionBlocExterne {
    id: string;
    patientId: string;
    prescripteurId: string;
    urgence: 'NORMALE' | 'URGENTE' | 'STAT' | string;
    alertes?: string | null;
    dateIntervention?: string | null;
    chirurgien?: string | null;
    consignes?: string | null;
    statut: string;
    chuId: string;
    serviceIdSource?: string | null;
    serviceIdDest: string;
    actes: ActeBlocExterne[];
}
export declare class PrescriptionExterneClient {
    private readonly http;
    private readonly config;
    private readonly logger;
    private readonly baseUrl;
    constructor(http: HttpService, config: ConfigService);
    getPrescriptionsBloc(serviceIdDest: string): Promise<PrescriptionBlocExterne[]>;
    updateStatut(id: string, statut: string): Promise<void>;
}
