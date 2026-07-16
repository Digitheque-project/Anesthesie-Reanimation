import { PatientBlocService } from './patient-bloc.service';
import { AdmitExistingPatientDto } from './dto/admit-existing-patient.dto';
import { RegisterAndAdmitPatientDto } from './dto/register-and-admit-patient.dto';
import { UpdatePatientBlocDto } from './dto/update-patient-bloc.dto';
export declare class PatientBlocController {
    private readonly patientBlocService;
    constructor(patientBlocService: PatientBlocService);
    search(q?: string): Promise<any[]>;
    getExternal(externalId: string): Promise<any>;
    admitExisting(dto: AdmitExistingPatientDto): Promise<import("../entities").PatientBloc>;
    registerAndAdmit(dto: RegisterAndAdmitPatientDto, req: any): Promise<import("../entities").PatientBloc>;
    findAll(statut?: string, niveauUrgence?: string, recherche?: string, page?: number, limite?: number): Promise<{
        data: import("../entities").PatientBloc[];
        total: number;
        page: number;
        pages: number;
    }>;
    findOne(patientId: string): Promise<import("../entities").PatientBloc | null>;
    update(patientId: string, dto: UpdatePatientBlocDto): Promise<import("../entities").PatientBloc>;
    remove(patientId: string): Promise<{
        message: string;
    }>;
}
