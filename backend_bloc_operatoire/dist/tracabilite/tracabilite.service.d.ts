import { Repository } from 'typeorm';
import { HistoriqueModification } from '../entities/historique-modification.entity';
export declare class TracabiliteService {
    private repo;
    private readonly logger;
    constructor(repo: Repository<HistoriqueModification>);
    log(entite: string, entiteId: string, action: string, details?: any, utilisateurId?: string): Promise<HistoriqueModification | null>;
    getHistorique(entite: string, entiteId: string): Promise<HistoriqueModification[]>;
    getTousHistoriques(page?: number, limite?: number): Promise<{
        data: HistoriqueModification[];
        total: number;
        page: number;
        pages: number;
    }>;
}
