import { Repository } from 'typeorm';
import { MomentOperatoire } from '../entities/moment-operatoire.entity';
import { OperationGateway } from '../operation-gateway/operation.gateway';
import { CentralUser } from '../central-auth/central-user.interface';
import { CreateMomentOperatoireDto } from './dto/create-moment-operatoire.dto';
export declare class MomentsOperatoireService {
    private repo;
    private gateway;
    constructor(repo: Repository<MomentOperatoire>, gateway: OperationGateway);
    create(dto: CreateMomentOperatoireDto, centralUser: CentralUser): Promise<MomentOperatoire>;
    findAll(patientId: string, inclureAnnules?: boolean): Promise<MomentOperatoire[]>;
    annuler(id: string, centralUser: CentralUser): Promise<MomentOperatoire>;
}
