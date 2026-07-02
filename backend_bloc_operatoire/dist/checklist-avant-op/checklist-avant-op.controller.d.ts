import { Repository } from 'typeorm';
import { ChecklistAvantOp } from '../entities/checklist-avant-op.entity';
import { AccueilClient } from '../external/accueil.client';
export declare class ChecklistAvantOpController {
    private repo;
    private accueilClient;
    constructor(repo: Repository<ChecklistAvantOp>, accueilClient: AccueilClient);
    create(dto: any): Promise<ChecklistAvantOp[]>;
    findAll(patientId?: string): Promise<(ChecklistAvantOp & {
        patient: import("../external/dto/external-patient.dto").ExternalPatient | null;
    })[]>;
    findOne(id: string): Promise<(ChecklistAvantOp & {
        patient: import("../external/dto/external-patient.dto").ExternalPatient | null;
    }) | null>;
    update(id: string, dto: any): Promise<import("typeorm").UpdateResult>;
}
