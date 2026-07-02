import { Repository } from 'typeorm';
import { ScoreSCCRE } from '../entities/score-sccre.entity';
import { AccueilClient } from '../external/accueil.client';
import { CreateScoreSCCREDto } from './dto/create-score-sccre.dto';
import { UpdateScoreSCCREDto } from './dto/update-score-sccre.dto';
export declare class ScoreSCCREService {
    private repo;
    private accueilClient;
    constructor(repo: Repository<ScoreSCCRE>, accueilClient: AccueilClient);
    create(dto: CreateScoreSCCREDto): Promise<ScoreSCCRE>;
    findAll(page?: number, limite?: number): Promise<{
        data: (ScoreSCCRE & {
            patient: import("../external/dto/external-patient.dto").ExternalPatient | null;
        })[];
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
