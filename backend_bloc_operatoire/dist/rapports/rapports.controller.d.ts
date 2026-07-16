import { RapportsService } from './rapports.service';
export declare class RapportsController {
    private readonly rapportsService;
    constructor(rapportsService: RapportsService);
    statistiques(dd?: string, df?: string): Promise<{
        totalPatients: number;
        totalOperations: number;
        totalUrgences: number;
        totalScores: number;
        totalMedecins: number;
        patientsParStatut: any[];
        urgencesParNiveau: any[];
    }>;
    activiteChirurgiens(dd?: string, df?: string): Promise<any[]>;
    cpaEnAttente(): Promise<any>;
    tauxOccupation(): Promise<any[]>;
    exportStats(): Promise<{
        type: string;
        genereLe: string;
        statistiques: {
            totalPatients: number;
            totalOperations: number;
            totalUrgences: number;
            totalScores: number;
            totalMedecins: number;
            patientsParStatut: any[];
            urgencesParNiveau: any[];
        };
        activiteParChirurgien: any[];
    }>;
}
