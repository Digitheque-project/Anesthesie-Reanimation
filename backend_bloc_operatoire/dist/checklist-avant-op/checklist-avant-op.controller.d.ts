import { Repository } from 'typeorm';
import { ChecklistAvantOp } from '../entities/checklist-avant-op.entity';
import { AccueilClient } from '../external/accueil.client';
export declare class ChecklistAvantOpController {
    private repo;
    private accueilClient;
    constructor(repo: Repository<ChecklistAvantOp>, accueilClient: AccueilClient);
    create(dto: any): Promise<ChecklistAvantOp[]>;
    findAll(patientId?: string): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: any): Promise<import("typeorm").UpdateResult>;
}
