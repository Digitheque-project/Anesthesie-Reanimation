import { Repository } from 'typeorm';
import { ChecklistApresOp } from '../entities/checklist-apres-op.entity';
import { AccueilClient } from '../external/accueil.client';
export declare class ChecklistApresOpController {
    private repo;
    private accueilClient;
    constructor(repo: Repository<ChecklistApresOp>, accueilClient: AccueilClient);
    create(dto: any): Promise<ChecklistApresOp[]>;
    findAll(patientId?: string): Promise<(ChecklistApresOp & {
        patient: import("../external/dto/external-patient.dto").ExternalPatient | null;
    })[]>;
    findOne(id: string): Promise<(ChecklistApresOp & {
        patient: import("../external/dto/external-patient.dto").ExternalPatient | null;
    }) | null>;
    update(id: string, dto: any): Promise<import("typeorm").UpdateResult>;
}
