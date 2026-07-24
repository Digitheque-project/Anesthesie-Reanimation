import { Repository } from 'typeorm';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { ActivitePerOp } from '../entities/activite-per-op.entity';
import { AccueilClient } from '../external/accueil.client';
import { MedecinIdentiteService } from '../medecin/medecin-identite.service';
import * as ExcelJS from 'exceljs';
export declare class ExportsService {
    private patientBlocRepo;
    private activiteRepo;
    private accueilClient;
    private medecinIdentiteService;
    constructor(patientBlocRepo: Repository<PatientBloc>, activiteRepo: Repository<ActivitePerOp>, accueilClient: AccueilClient, medecinIdentiteService: MedecinIdentiteService);
    exportPatientsExcel(): Promise<ExcelJS.Buffer>;
    exportPlanningExcel(date: string): Promise<ExcelJS.Buffer>;
    exportPatientJSON(patientId: string): Promise<any>;
}
