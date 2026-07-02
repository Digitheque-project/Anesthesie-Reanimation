import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { DemandeCpaExterne, StatutDemandeCpaExterne } from '../entities/demande-cpa-externe.entity';
import { ReceiveDemandeCpaDto } from './dto/receive-demande-cpa.dto';
import { UpdateDemandeCpaDto } from './dto/update-demande-cpa.dto';
export declare class DemandeCpaExterneService {
    private repo;
    private config;
    private readonly logger;
    constructor(repo: Repository<DemandeCpaExterne>, config: ConfigService);
    receive(dto: ReceiveDemandeCpaDto): Promise<DemandeCpaExterne>;
    findAll(statut?: StatutDemandeCpaExterne): Promise<DemandeCpaExterne[]>;
    findOne(id: string): Promise<DemandeCpaExterne>;
    update(id: string, dto: UpdateDemandeCpaDto): Promise<DemandeCpaExterne>;
    trouverDemandeOuverte(patientId: string): Promise<DemandeCpaExterne | null>;
    marquerCpaRealisee(demande: DemandeCpaExterne, cpaId: string, apte: boolean): Promise<DemandeCpaExterne>;
    marquerVpaRealisee(demande: DemandeCpaExterne, vpaId: string): Promise<DemandeCpaExterne>;
}
