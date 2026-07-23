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
        statistiques: {
            totalSortiesReveil: number;
            totalPatients: number;
            totalPatientsActifs: number;
            totalOperations: number;
            totalUrgences: number;
            totalScores: number;
            totalMedecins: number;
            patientsParStatut: any[];
            urgencesParNiveau: any[];
        };
        activiteParChirurgien: any[];
        activiteParAnesthesiste: {
            medecinId: string;
            nomComplet: string;
            nbCPA: number;
            nbOperations: number;
            nbScoresSCCRE: number;
        }[];
        decisionsCPA: any[];
        typesChirurgie: any[];
        tachesAccomplies: {
            checklistsAvantOp: number;
            checklistsPendantOp: number;
            checklistsApresOp: number;
            momentsOperatoires: number;
        };
        evolutionQuotidienne: any[];
        operationsDetail: {
            patientNom: string;
            libelle: any;
            typeChirurgie: any;
            niveauUrgence: any;
            statut: any;
            dateOperation: Date;
            chirurgien: string;
            anesthesiste: string;
        }[];
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
    cpaEnAttente(): Promise<any>;
    tauxOccupation(): Promise<any[]>;
    exportStats(): Promise<{
        periode: {
            dateDebut: string | null;
            dateFin: string | null;
        };
        genereLe: string;
        statistiques: {
            totalSortiesReveil: number;
            totalPatients: number;
            totalPatientsActifs: number;
            totalOperations: number;
            totalUrgences: number;
            totalScores: number;
            totalMedecins: number;
            patientsParStatut: any[];
            urgencesParNiveau: any[];
        };
        activiteParChirurgien: any[];
        activiteParAnesthesiste: {
            medecinId: string;
            nomComplet: string;
            nbCPA: number;
            nbOperations: number;
            nbScoresSCCRE: number;
        }[];
        decisionsCPA: any[];
        typesChirurgie: any[];
        tachesAccomplies: {
            checklistsAvantOp: number;
            checklistsPendantOp: number;
            checklistsApresOp: number;
            momentsOperatoires: number;
        };
        evolutionQuotidienne: any[];
        operationsDetail: {
            patientNom: string;
            libelle: any;
            typeChirurgie: any;
            niveauUrgence: any;
            statut: any;
            dateOperation: Date;
            chirurgien: string;
            anesthesiste: string;
        }[];
    }>;
}
