import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { DemandeCpaExterne } from '../entities/demande-cpa-externe.entity';
import { AccueilClient } from '../external/accueil.client';
import { DossierPatientClient } from '../external/dossier-patient.client';
import { ProtocoleOperatoireService } from '../protocole-operatoire/protocole-operatoire.service';
export declare class PatientBlocService {
    private patientRepo;
    private demandeRepo;
    private accueilClient;
    private dossierPatientClient;
    private protocoleOperatoireService;
    private config;
    constructor(patientRepo: Repository<PatientBloc>, demandeRepo: Repository<DemandeCpaExterne>, accueilClient: AccueilClient, dossierPatientClient: DossierPatientClient, protocoleOperatoireService: ProtocoleOperatoireService, config: ConfigService);
    creerDepuisPrescription(demandeId: string): Promise<PatientBloc>;
    estStat(patientId: string): boolean;
    findAll(filters: {
        statut?: string;
        niveauUrgence?: string;
        recherche?: string;
        page?: number;
        limite?: number;
    }): Promise<{
        data: any[];
        total: number;
        page: number;
        pages: number;
    }>;
    findOne(patientId: string): Promise<PatientBloc | null>;
    getDossierMedical(patientId: string, token: string): Promise<{
        antecedents: any[];
        diagnostics: any[];
        histoireMaladie: any[];
        alertesUrgentes: any[];
        dernierExamen: any[];
        examensComplementaires: any[];
        suivis: any[];
    }>;
    getDossierComplet(patientId: string, token: string): Promise<{
        observations: any[];
        diagnostics: any[];
        antecedents: any[];
        histoiresMaladie: any[];
        examensPhysiques: any[];
        examensComplementaires: any[];
        suivis: any[];
        protocolesOperatoires: any;
        sortie: any[];
    }>;
    update(patientId: string, dto: any): Promise<PatientBloc>;
    remove(patientId: string): Promise<{
        message: string;
    }>;
    search(q?: string): Promise<any[]>;
    getExternal(externalId: string): Promise<any>;
    admitExisting(dto: any): Promise<PatientBloc>;
    registerAndAdmit(dto: any, createdBy: string): Promise<PatientBloc>;
}
