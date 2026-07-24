import { Repository } from 'typeorm';
import { ActivitePerOp } from '../entities/activite-per-op.entity';
import { ConstantePerOp } from '../entities/constante-per-op.entity';
import { AccueilClient } from '../external/accueil.client';
import { MedecinIdentiteService } from '../medecin/medecin-identite.service';
import { OperationGateway } from '../operation-gateway/operation.gateway';
import { CreateActivitePerOpDto } from './dto/create-activite-per-op.dto';
import { UpdateActivitePerOpDto } from './dto/update-activite-per-op.dto';
import { AjouterConstanteDto } from './dto/ajouter-constante.dto';
export declare class ActivitePerOpService {
    private repo;
    private constanteRepo;
    private accueilClient;
    private medecinIdentiteService;
    private gateway;
    constructor(repo: Repository<ActivitePerOp>, constanteRepo: Repository<ConstantePerOp>, accueilClient: AccueilClient, medecinIdentiteService: MedecinIdentiteService, gateway: OperationGateway);
    create(dto: CreateActivitePerOpDto): Promise<ActivitePerOp>;
    findAll(page?: number, limite?: number, patientId?: string): Promise<{
        data: Record<string, any>[];
        total: number;
        page: number;
        pages: number;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateActivitePerOpDto): Promise<ActivitePerOp>;
    remove(id: string): Promise<{
        message: string;
    }>;
    ajouterConstante(activiteId: string, dto: AjouterConstanteDto): Promise<ConstantePerOp>;
}
