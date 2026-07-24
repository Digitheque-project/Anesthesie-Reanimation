import { Repository } from 'typeorm';
import { ScoreSCCRE } from '../entities/score-sccre.entity';
import { AccueilClient } from '../external/accueil.client';
import { MedecinIdentiteService } from '../medecin/medecin-identite.service';
import { CentralUser } from '../central-auth/central-user.interface';
import { CreateScoreSCCREDto } from './dto/create-score-sccre.dto';
import { UpdateScoreSCCREDto } from './dto/update-score-sccre.dto';
export declare class ScoreSCCREService {
    private repo;
    private accueilClient;
    private medecinIdentiteService;
    constructor(repo: Repository<ScoreSCCRE>, accueilClient: AccueilClient, medecinIdentiteService: MedecinIdentiteService);
    create(dto: CreateScoreSCCREDto, centralUser: CentralUser): Promise<ScoreSCCRE>;
    findAll(page?: number, limite?: number): Promise<{
        data: Record<string, any>[];
        total: number;
        page: number;
        pages: number;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateScoreSCCREDto): Promise<ScoreSCCRE>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
