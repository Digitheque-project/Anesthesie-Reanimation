import { Repository } from 'typeorm';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { DemandeCpaExterne } from '../entities/demande-cpa-externe.entity';
export declare class PatientBlocService {
    private patientRepo;
    private demandeRepo;
    constructor(patientRepo: Repository<PatientBloc>, demandeRepo: Repository<DemandeCpaExterne>);
    creerDepuisPrescription(demandeId: string): Promise<PatientBloc>;
    estStat(patientId: string): boolean;
    findAll(filters: {
        statut?: string;
        niveauUrgence?: string;
        recherche?: string;
        page?: number;
        limite?: number;
    }): Promise<{
        data: PatientBloc[];
        total: number;
        page: number;
        pages: number;
    }>;
    findOne(patientId: string): Promise<PatientBloc | null>;
    update(patientId: string, dto: any): Promise<PatientBloc>;
    remove(patientId: string): Promise<{
        message: string;
    }>;
    search(q?: string): Promise<any[]>;
    getExternal(externalId: string): Promise<any>;
    admitExisting(dto: any): Promise<PatientBloc>;
    registerAndAdmit(dto: any, createdBy: string): Promise<PatientBloc>;
}
