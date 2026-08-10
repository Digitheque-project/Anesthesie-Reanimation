import { DemandeCpaExterneService } from './demande-cpa-externe.service';
import { ReceiveDemandeCpaDto } from './dto/receive-demande-cpa.dto';
import { ReceiveDemandeCpaResponseDto } from './dto/receive-demande-cpa-response.dto';
import { StatutDemandeCpaPubliqueDto } from './dto/statut-demande-cpa-publique.dto';
import { UpdateDemandeCpaDto } from './dto/update-demande-cpa.dto';
import { PlanifierDemandeCpaDto } from './dto/planifier-demande-cpa.dto';
import { StatutDemandeCpaExterne } from '../entities/demande-cpa-externe.entity';
export declare class DemandeCpaExterneController {
    private readonly service;
    constructor(service: DemandeCpaExterneService);
    receive(dto: ReceiveDemandeCpaDto): Promise<ReceiveDemandeCpaResponseDto>;
    getStatutPublic(id: string): Promise<StatutDemandeCpaPubliqueDto>;
    findAll(statut?: StatutDemandeCpaExterne, patientId?: string): Promise<any>;
    findOne(id: string): Promise<import("../entities/demande-cpa-externe.entity").DemandeCpaExterne>;
    update(id: string, dto: UpdateDemandeCpaDto): Promise<import("../entities/demande-cpa-externe.entity").DemandeCpaExterne>;
    marquerLu(id: string): Promise<import("../entities/demande-cpa-externe.entity").DemandeCpaExterne>;
    planifier(id: string, dto: PlanifierDemandeCpaDto): Promise<import("../entities/demande-cpa-externe.entity").DemandeCpaExterne>;
}
