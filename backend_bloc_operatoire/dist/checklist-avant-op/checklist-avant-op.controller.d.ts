import { Repository } from 'typeorm';
import { ChecklistAvantOp } from '../entities/checklist-avant-op.entity';
import { AccueilClient } from '../external/accueil.client';
import { TracabiliteService } from '../tracabilite/tracabilite.service';
import { CreateChecklistAvantOpDto } from './dto/create-checklist-avant-op.dto';
import { UpdateChecklistAvantOpDto } from './dto/update-checklist-avant-op.dto';
export declare class ChecklistAvantOpController {
    private repo;
    private accueilClient;
    private tracabiliteService;
    constructor(repo: Repository<ChecklistAvantOp>, accueilClient: AccueilClient, tracabiliteService: TracabiliteService);
    create(dto: CreateChecklistAvantOpDto, req: any): Promise<ChecklistAvantOp>;
    findAll(patientId?: string): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateChecklistAvantOpDto, req: any): Promise<import("typeorm").UpdateResult>;
}
