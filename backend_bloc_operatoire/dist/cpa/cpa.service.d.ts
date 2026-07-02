import { Repository } from 'typeorm';
import { CPA } from '../entities/cpa.entity';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { Premedicament } from '../entities/premedicament.entity';
import { AccueilClient } from '../external/accueil.client';
import { EndoscopieClient } from '../external/endoscopie.client';
import { DemandeCpaExterneService } from '../demande-cpa-externe/demande-cpa-externe.service';
import { CreateCPADto } from './dto/create-cpa.dto';
import { UpdateCPADto } from './dto/update-cpa.dto';
export declare class CPAService {
    private cpaRepository;
    private patientBlocRepo;
    private premedRepository;
    private accueilClient;
    private endoscopieClient;
    private demandeCpaExterneService;
    constructor(cpaRepository: Repository<CPA>, patientBlocRepo: Repository<PatientBloc>, premedRepository: Repository<Premedicament>, accueilClient: AccueilClient, endoscopieClient: EndoscopieClient, demandeCpaExterneService: DemandeCpaExterneService);
    create(dto: CreateCPADto): Promise<CPA>;
    findAll(page?: number, limite?: number): Promise<{
        data: (CPA & {
            patient: import("../external/dto/external-patient.dto").ExternalPatient | null;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateCPADto): Promise<CPA>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
