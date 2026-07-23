import { ChecklistApresOpService } from './checklist-apres-op.service';
import { CreateChecklistApresOpDto } from './dto/create-checklist-apres-op.dto';
import { UpdateChecklistApresOpDto } from './dto/update-checklist-apres-op.dto';
export declare class ChecklistApresOpController {
    private readonly service;
    constructor(service: ChecklistApresOpService);
    create(dto: CreateChecklistApresOpDto, req: any): Promise<import("../entities").ChecklistApresOp>;
    findAll(patientId?: string): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateChecklistApresOpDto): Promise<import("../entities").ChecklistApresOp>;
}
