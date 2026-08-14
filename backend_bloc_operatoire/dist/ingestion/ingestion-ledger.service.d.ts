import { Repository } from 'typeorm';
import { CanalIngestion, IngestionExterne } from '../entities/ingestion-externe.entity';
export declare class IngestionLedgerService {
    private readonly repo;
    private readonly logger;
    constructor(repo: Repository<IngestionExterne>);
    dejaIngeree(canal: CanalIngestion, referenceExterne?: string | null): Promise<boolean>;
    marquerIngeree(params: {
        canal: CanalIngestion;
        referenceExterne?: string | null;
        patientId: string;
        serviceSourceId?: string | null;
        libelle?: string | null;
    }): Promise<void>;
}
