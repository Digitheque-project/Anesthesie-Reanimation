import { DemandeCpaExterneService } from './demande-cpa-externe.service';
import { ReceiveDemandeCpaDto } from './dto/receive-demande-cpa.dto';
import { UpdateDemandeCpaDto } from './dto/update-demande-cpa.dto';
import { StatutDemandeCpaExterne } from '../entities/demande-cpa-externe.entity';
export declare class DemandeCpaExterneController {
    private readonly service;
    constructor(service: DemandeCpaExterneService);
    receive(dto: ReceiveDemandeCpaDto): Promise<{
        received: boolean;
        id: string;
        statut: StatutDemandeCpaExterne;
        timestamp: string;
    }>;
    findAll(statut?: StatutDemandeCpaExterne): Promise<import("../entities/demande-cpa-externe.entity").DemandeCpaExterne[]>;
    findOne(id: string): Promise<import("../entities/demande-cpa-externe.entity").DemandeCpaExterne>;
    update(id: string, dto: UpdateDemandeCpaDto): Promise<import("../entities/demande-cpa-externe.entity").DemandeCpaExterne>;
}
