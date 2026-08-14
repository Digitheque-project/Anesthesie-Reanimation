import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { ServiceTokenService } from '../central-auth/service-token.service';
export interface DetailOperatoireExterne {
    renseignementClinique?: string | null;
    renseignementsCliniques?: string | null;
    typeAnesthesie?: string | null;
    dureeIntervention?: number | string | null;
    dureePrevue?: number | string | null;
    dureeInterventionMinutes?: number | string | null;
    risqueInfectieux?: string | null;
    materielNecessaire?: string | null;
    materiel?: string | null;
    positionPatient?: string | null;
    position?: string | null;
}
export interface ActeBlocExterne extends DetailOperatoireExterne {
    id: string;
    libelle: string;
    cote?: string | null;
    typeChirurgie?: string | null;
    risqueHemorragique?: string | null;
    dateIntervention?: string | null;
    heureIntervention?: string | null;
    nomChirurgien?: string | null;
}
export interface PrescriptionBlocExterne extends DetailOperatoireExterne {
    id: string;
    patientId: string;
    prescripteurId: string;
    urgence: 'NORMAL' | 'URGENT' | 'TRES_URGENT' | string;
    alertes?: string | null;
    dateIntervention?: string | null;
    chirurgien?: string | null;
    consignes?: string | null;
    typeChirurgie?: string | null;
    risqueHemorragique?: string | null;
    statut: string;
    chuId: string;
    serviceIdSource?: string | null;
    serviceIdDest: string;
    actes?: ActeBlocExterne[];
    ActeBloc?: ActeBlocExterne[];
}
export declare class PrescriptionExterneClient {
    private readonly http;
    private readonly config;
    private readonly serviceToken;
    private readonly logger;
    private readonly baseUrl;
    constructor(http: HttpService, config: ConfigService, serviceToken: ServiceTokenService);
    private authHeaders;
    getPrescriptionsBloc(serviceIdDest: string): Promise<PrescriptionBlocExterne[]>;
    updateStatut(id: string, statut: string): Promise<void>;
}
