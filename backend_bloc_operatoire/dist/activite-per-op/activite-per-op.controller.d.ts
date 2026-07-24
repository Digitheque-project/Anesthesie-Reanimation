import { ActivitePerOpService } from './activite-per-op.service';
import { CreateActivitePerOpDto } from './dto/create-activite-per-op.dto';
import { UpdateActivitePerOpDto } from './dto/update-activite-per-op.dto';
import { AjouterConstanteDto } from './dto/ajouter-constante.dto';
export declare class ActivitePerOpController {
    private readonly service;
    constructor(service: ActivitePerOpService);
    create(dto: CreateActivitePerOpDto): Promise<import("../entities").ActivitePerOp>;
    findAll(p?: number, l?: number, patientId?: string): Promise<{
        data: Record<string, any>[];
        total: number;
        page: number;
        pages: number;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateActivitePerOpDto): Promise<import("../entities").ActivitePerOp>;
    ajouterConstante(id: string, dto: AjouterConstanteDto): Promise<import("../entities").ConstantePerOp>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
