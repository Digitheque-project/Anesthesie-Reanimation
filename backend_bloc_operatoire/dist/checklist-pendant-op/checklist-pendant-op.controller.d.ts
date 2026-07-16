import { Repository } from 'typeorm';
import { ChecklistPendantOp } from '../entities/checklist-pendant-op.entity';
import { AccueilClient } from '../external/accueil.client';
export declare class ChecklistPendantOpController {
    private repo;
    private accueilClient;
    constructor(repo: Repository<ChecklistPendantOp>, accueilClient: AccueilClient);
    create(dto: any): Promise<ChecklistPendantOp[]>;
    findAll(patientId?: string): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: any): Promise<import("typeorm").UpdateResult>;
}
