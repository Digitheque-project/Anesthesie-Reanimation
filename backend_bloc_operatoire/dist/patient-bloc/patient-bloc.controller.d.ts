import { PatientBlocService } from './patient-bloc.service';
import { PatientBlocStatutService } from './patient-bloc-statut.service';
import { AdmitExistingPatientDto } from './dto/admit-existing-patient.dto';
import { RegisterAndAdmitPatientDto } from './dto/register-and-admit-patient.dto';
import { UpdatePatientBlocDto } from './dto/update-patient-bloc.dto';
import { UpdateDateInterventionDto } from './dto/update-date-intervention.dto';
export declare class PatientBlocController {
    private readonly patientBlocService;
    private readonly patientBlocStatutService;
    constructor(patientBlocService: PatientBlocService, patientBlocStatutService: PatientBlocStatutService);
    search(q?: string): Promise<any[]>;
    getExternal(externalId: string): Promise<any>;
    admitExisting(dto: AdmitExistingPatientDto): Promise<import("../entities").PatientBloc>;
    registerAndAdmit(dto: RegisterAndAdmitPatientDto, req: any): Promise<import("../entities").PatientBloc>;
    findAll(statut?: string, niveauUrgence?: string, recherche?: string, page?: number, limite?: number): Promise<{
        data: any[];
        total: number;
        page: number;
        pages: number;
    }>;
    findOne(patientId: string): Promise<import("../entities").PatientBloc | null>;
    getDossierMedical(patientId: string, req: any): Promise<{
        antecedents: any[];
        diagnostics: any[];
        histoireMaladie: any[];
        alertesUrgentes: any[];
        dernierExamen: any[];
        examensComplementaires: any[];
        suivis: any[];
    }>;
    getDossierComplet(patientId: string, req: any): Promise<{
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
    update(patientId: string, dto: UpdatePatientBlocDto): Promise<import("../entities").PatientBloc>;
    marquerApteCpa(patientId: string): Promise<import("../entities").PatientBloc>;
    marquerInapteCpa(patientId: string, motifRefus: string): Promise<import("../entities").PatientBloc>;
    modifierDateIntervention(patientId: string, dto: UpdateDateInterventionDto): Promise<import("../entities").PatientBloc>;
    remove(patientId: string): Promise<{
        message: string;
    }>;
}
