import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { AccueilClient } from '../external/accueil.client';
import { AdmitExistingPatientDto } from './dto/admit-existing-patient.dto';
import { RegisterAndAdmitPatientDto } from './dto/register-and-admit-patient.dto';
import { UpdatePatientBlocDto } from './dto/update-patient-bloc.dto';
export declare class PatientBlocService {
    private patientBlocRepo;
    private accueilClient;
    private config;
    constructor(patientBlocRepo: Repository<PatientBloc>, accueilClient: AccueilClient, config: ConfigService);
    search(q?: string): Promise<import("../external/dto/external-patient.dto").ExternalPatient[]>;
    getExternal(externalId: string): Promise<import("../external/dto/external-patient.dto").ExternalPatient>;
    admitExisting(dto: AdmitExistingPatientDto): Promise<PatientBloc>;
    registerAndAdmit(dto: RegisterAndAdmitPatientDto, createdBy: string): Promise<PatientBloc>;
    findAll(filters?: {
        statut?: string;
        niveauUrgence?: string;
        recherche?: string;
        page?: number;
        limite?: number;
    }): Promise<{
        data: (PatientBloc & {
            patient: import("../external/dto/external-patient.dto").ExternalPatient | null;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
    findOne(patientId: string): Promise<PatientBloc & {
        patient: import("../external/dto/external-patient.dto").ExternalPatient | null;
    }>;
    update(patientId: string, dto: UpdatePatientBlocDto): Promise<PatientBloc>;
    remove(patientId: string): Promise<{
        message: string;
    }>;
}
