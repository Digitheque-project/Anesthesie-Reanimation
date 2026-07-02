import { Repository } from 'typeorm';
import { VPA } from '../entities/vpa.entity';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { AccueilClient } from '../external/accueil.client';
import { EndoscopieClient } from '../external/endoscopie.client';
import { DemandeCpaExterneService } from '../demande-cpa-externe/demande-cpa-externe.service';
import { CreateVPADto } from './dto/create-vpa.dto';
import { UpdateVPADto } from './dto/update-vpa.dto';
export declare class VPAService {
    private repo;
    private patientBlocRepo;
    private accueilClient;
    private endoscopieClient;
    private demandeCpaExterneService;
    constructor(repo: Repository<VPA>, patientBlocRepo: Repository<PatientBloc>, accueilClient: AccueilClient, endoscopieClient: EndoscopieClient, demandeCpaExterneService: DemandeCpaExterneService);
    create(dto: CreateVPADto): Promise<VPA>;
    findAll(page?: number, limite?: number): Promise<{
        data: (VPA & {
            patient: import("../external/dto/external-patient.dto").ExternalPatient | null;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateVPADto): Promise<VPA>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
