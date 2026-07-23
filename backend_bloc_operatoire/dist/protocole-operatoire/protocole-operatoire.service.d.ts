import { Repository } from 'typeorm';
import { ProtocoleOperatoire } from '../entities/protocole-operatoire.entity';
import { Drainage } from '../entities/drainage.entity';
import { AccueilClient } from '../external/accueil.client';
import { OperationGateway } from '../operation-gateway/operation.gateway';
import { CreateProtocoleOperatoireDto } from './dto/create-protocole-operatoire.dto';
import { UpdateProtocoleOperatoireDto } from './dto/update-protocole-operatoire.dto';
export declare class ProtocoleOperatoireService {
    private repo;
    private drainageRepo;
    private accueilClient;
    private gateway;
    constructor(repo: Repository<ProtocoleOperatoire>, drainageRepo: Repository<Drainage>, accueilClient: AccueilClient, gateway: OperationGateway);
    create(dto: CreateProtocoleOperatoireDto): Promise<ProtocoleOperatoire>;
    findAll(page?: number, limite?: number, patientId?: string): Promise<{
        data: any;
        total: number;
        page: number;
        pages: number;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateProtocoleOperatoireDto): Promise<ProtocoleOperatoire>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
