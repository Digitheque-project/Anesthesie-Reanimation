import { RapportsService } from './rapports.service';
export declare class RapportsController {
    private readonly rapportsService;
    constructor(rapportsService: RapportsService);
    tableauDeBord(dd?: string, df?: string): Promise<{
        periode: {
            dateDebut: string | null;
            dateFin: string | null;
        };
        genereLe: string;
        statistiques: any;
        activiteParChirurgien: any;
        activiteParAnesthesiste: any;
        activiteParIbode: any;
        activiteParResponsableCpa: any;
        decisionsCPA: any;
        typesChirurgie: any;
        tachesAccomplies: any;
        evolutionQuotidienne: any;
        operationsDetail: any;
    }>;
    statistiques(dd?: string, df?: string): Promise<{
        totalPatients: number;
        totalPatientsActifs: number;
        totalOperations: number;
        totalUrgences: number;
        totalScores: number;
        totalMedecins: number;
        patientsParStatut: any[];
        urgencesParNiveau: any[];
    }>;
    activiteChirurgiens(dd?: string, df?: string): Promise<any[]>;
    cpaEnAttente(): Promise<Record<string, any>[]>;
    tauxOccupation(): Promise<any[]>;
    exportStats(): Promise<{
        periode: {
            dateDebut: string | null;
            dateFin: string | null;
        };
        genereLe: string;
        statistiques: any;
        activiteParChirurgien: any;
        activiteParAnesthesiste: any;
        activiteParIbode: any;
        activiteParResponsableCpa: any;
        decisionsCPA: any;
        typesChirurgie: any;
        tachesAccomplies: any;
        evolutionQuotidienne: any;
        operationsDetail: any;
    }>;
}
