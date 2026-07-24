import { MedecinService } from './medecin.service';
import { CentralUserClient } from '../external/central-user.client';
export declare class MedecinIdentiteService {
    private readonly medecinService;
    private readonly centralUserClient;
    constructor(medecinService: MedecinService, centralUserClient: CentralUserClient);
    resoudreLot(ids: (string | null | undefined)[]): Promise<Record<string, any>>;
    enrichir<T extends Record<string, any>>(records: T[], idField: string, outputKey: string): Promise<(T & Record<string, any>)[]>;
    enrichirPlusieurs<T extends Record<string, any>>(records: T[], paires: [string, string][]): Promise<(T & Record<string, any>)[]>;
}
