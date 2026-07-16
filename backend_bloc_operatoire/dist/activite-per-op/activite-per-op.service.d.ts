import { Repository } from 'typeorm';
import { ActivitePerOp } from '../entities/activite-per-op.entity';
import { ConstantePerOp } from '../entities/constante-per-op.entity';
import { AccueilClient } from '../external/accueil.client';
import { CreateActivitePerOpDto } from './dto/create-activite-per-op.dto';
import { UpdateActivitePerOpDto } from './dto/update-activite-per-op.dto';
export declare class ActivitePerOpService {
    private repo;
    private constanteRepo;
    private accueilClient;
    constructor(repo: Repository<ActivitePerOp>, constanteRepo: Repository<ConstantePerOp>, accueilClient: AccueilClient);
    create(dto: CreateActivitePerOpDto): Promise<ActivitePerOp>;
    findAll(page?: number, limite?: number): Promise<{
        data: any;
        total: number;
        page: number;
        pages: number;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateActivitePerOpDto): Promise<ActivitePerOp>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
