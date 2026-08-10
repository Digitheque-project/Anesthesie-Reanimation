import { Repository } from 'typeorm';
import { SortieReveil } from '../entities/sortie-reveil.entity';
import { ScoreSCCRE } from '../entities/score-sccre.entity';
import { AccueilClient } from '../external/accueil.client';
import { MedecinIdentiteService } from '../medecin/medecin-identite.service';
import { PatientBlocStatutService } from '../patient-bloc/patient-bloc-statut.service';
import { CentralUser } from '../central-auth/central-user.interface';
import { TracabiliteService } from '../tracabilite/tracabilite.service';
import { CreateSortieReveilDto } from './dto/create-sortie-reveil.dto';
import { UpdateSortieReveilDto } from './dto/update-sortie-reveil.dto';
export declare class SortieReveilService {
    private repo;
    private scoreRepo;
    private accueilClient;
    private medecinIdentiteService;
    private patientBlocStatutService;
    private tracabiliteService;
    constructor(repo: Repository<SortieReveil>, scoreRepo: Repository<ScoreSCCRE>, accueilClient: AccueilClient, medecinIdentiteService: MedecinIdentiteService, patientBlocStatutService: PatientBlocStatutService, tracabiliteService: TracabiliteService);
    create(dto: CreateSortieReveilDto, centralUser: CentralUser): Promise<SortieReveil>;
    findAll(page?: number, limite?: number): Promise<{
        data: Record<string, any>[];
        total: number;
        page: number;
        pages: number;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateSortieReveilDto): Promise<SortieReveil>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
