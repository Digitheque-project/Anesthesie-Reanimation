import { ActivitePerOpService } from './activite-per-op.service';
import { CreateActivitePerOpDto } from './dto/create-activite-per-op.dto';
import { UpdateActivitePerOpDto } from './dto/update-activite-per-op.dto';
export declare class ActivitePerOpController {
    private readonly service;
    constructor(service: ActivitePerOpService);
    create(dto: CreateActivitePerOpDto): Promise<import("../entities").ActivitePerOp>;
    findAll(p?: number, l?: number): Promise<{
        data: (import("../entities").ActivitePerOp & {
            patient: import("../external/dto/external-patient.dto").ExternalPatient | null;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateActivitePerOpDto): Promise<import("../entities").ActivitePerOp>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
