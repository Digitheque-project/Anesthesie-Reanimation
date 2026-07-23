import { DemandeCpaExterneService } from './demande-cpa-externe.service';
import { ReceiveDemandeCpaDto } from './dto/receive-demande-cpa.dto';
import { UpdateDemandeCpaDto } from './dto/update-demande-cpa.dto';
import { PlanifierDemandeCpaDto } from './dto/planifier-demande-cpa.dto';
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
    getStatutPublic(id: string): Promise<{
        id: string;
        patientId: string;
        sourceReferenceId: string;
        statut: StatutDemandeCpaExterne;
        cpaId: string | null;
        vpaId: string | null;
        dateCpaPlanifiee: Date;
        dateVpaPlanifiee: Date;
    }>;
    findAll(statut?: StatutDemandeCpaExterne): Promise<any>;
    findOne(id: string): Promise<import("../entities/demande-cpa-externe.entity").DemandeCpaExterne>;
    update(id: string, dto: UpdateDemandeCpaDto): Promise<import("../entities/demande-cpa-externe.entity").DemandeCpaExterne>;
    planifier(id: string, dto: PlanifierDemandeCpaDto): Promise<import("../entities/demande-cpa-externe.entity").DemandeCpaExterne>;
}
