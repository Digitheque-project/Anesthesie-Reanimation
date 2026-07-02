import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { ExternalPatient } from './dto/external-patient.dto';
import { RegisterPatientDto } from './dto/register-patient.dto';
export declare class AccueilClient {
    private readonly http;
    private readonly config;
    private readonly logger;
    private readonly baseUrl;
    private readonly chuId;
    constructor(http: HttpService, config: ConfigService);
    listPatients(chuId?: string): Promise<ExternalPatient[]>;
    getPatient(id: string, chuId?: string): Promise<ExternalPatient | null>;
    registerPatient(dto: RegisterPatientDto, createdBy: string): Promise<ExternalPatient>;
    searchPatients(query: string, chuId?: string): Promise<ExternalPatient[]>;
    enrichWithIdentity<T extends {
        patientId: string;
    }>(records: T[], chuId?: string): Promise<Array<T & {
        patient: ExternalPatient | null;
    }>>;
}
