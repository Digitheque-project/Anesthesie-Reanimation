import { Repository } from 'typeorm';
import { VerificationVeille } from '../entities/verification-veille.entity';
import { CPA } from '../entities/cpa.entity';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { AccueilClient } from '../external/accueil.client';
import { EndoscopieClient } from '../external/endoscopie.client';
import { MedecinIdentiteService } from '../medecin/medecin-identite.service';
import { DemandeCpaExterneService } from '../demande-cpa-externe/demande-cpa-externe.service';
import { PatientBlocStatutService } from '../patient-bloc/patient-bloc-statut.service';
import { CreateVerificationVeilleDto } from './dto/create-verification-veille.dto';
import { UpdateVerificationVeilleDto } from './dto/update-verification-veille.dto';
export declare class VerificationVeilleService {
    private repo;
    private patientBlocRepo;
    private cpaRepo;
    private accueilClient;
    private endoscopieClient;
    private medecinIdentiteService;
    private demandeCpaExterneService;
    private patientBlocStatutService;
    private readonly logger;
    constructor(repo: Repository<VerificationVeille>, patientBlocRepo: Repository<PatientBloc>, cpaRepo: Repository<CPA>, accueilClient: AccueilClient, endoscopieClient: EndoscopieClient, medecinIdentiteService: MedecinIdentiteService, demandeCpaExterneService: DemandeCpaExterneService, patientBlocStatutService: PatientBlocStatutService);
    create(dto: CreateVerificationVeilleDto): Promise<VerificationVeille>;
    findAll(page?: number, limite?: number): Promise<{
        data: Record<string, any>[];
        total: number;
        page: number;
        pages: number;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateVerificationVeilleDto): Promise<VerificationVeille>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
