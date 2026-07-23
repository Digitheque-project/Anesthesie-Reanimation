import { ChecklistPendantOpService } from './checklist-pendant-op.service';
import { CreateChecklistPendantOpDto } from './dto/create-checklist-pendant-op.dto';
import { UpdateChecklistPendantOpDto } from './dto/update-checklist-pendant-op.dto';
export declare class ChecklistPendantOpController {
    private readonly service;
    constructor(service: ChecklistPendantOpService);
    create(dto: CreateChecklistPendantOpDto, req: any): Promise<import("../entities").ChecklistPendantOp>;
    findAll(patientId?: string): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateChecklistPendantOpDto): Promise<import("../entities").ChecklistPendantOp>;
}
