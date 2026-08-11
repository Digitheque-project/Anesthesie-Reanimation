import { Repository } from 'typeorm';
import { VerificationVeille } from '../entities/verification-veille.entity';
import { CPA } from '../entities/cpa.entity';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { AccueilClient } from '../external/accueil.client';
import { EndoscopieClient } from '../external/endoscopie.client';
import { MedecinIdentiteService } from '../medecin/medecin-identite.service';
import { DemandeCpaExterneService } from '../demande-cpa-externe/demande-cpa-externe.service';
import { PatientBlocStatutService } from '../patient-bloc/patient-bloc-statut.service';
import { TracabiliteService } from '../tracabilite/tracabilite.service';
import { CreateVerificationVeilleDto } from './dto/create-verification-veille.dto';
import { UpdateVerificationVeilleDto } from './dto/update-verification-veille.dto';
import { FichiersVerificationVeilleService } from './fichiers-verification-veille.service';
export declare class VerificationVeilleService {
    private repo;
    private patientBlocRepo;
    private cpaRepo;
    private accueilClient;
    private endoscopieClient;
    private medecinIdentiteService;
    private demandeCpaExterneService;
    private patientBlocStatutService;
    private tracabiliteService;
    private fichiersService;
    private readonly logger;
    constructor(repo: Repository<VerificationVeille>, patientBlocRepo: Repository<PatientBloc>, cpaRepo: Repository<CPA>, accueilClient: AccueilClient, endoscopieClient: EndoscopieClient, medecinIdentiteService: MedecinIdentiteService, demandeCpaExterneService: DemandeCpaExterneService, patientBlocStatutService: PatientBlocStatutService, tracabiliteService: TracabiliteService, fichiersService: FichiersVerificationVeilleService);
    create(dto: CreateVerificationVeilleDto, utilisateurId?: string): Promise<VerificationVeille>;
    findAll(page?: number, limite?: number): Promise<{
        data: Record<string, any>[];
        total: number;
        page: number;
        pages: number;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateVerificationVeilleDto, utilisateurId?: string): Promise<VerificationVeille>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
