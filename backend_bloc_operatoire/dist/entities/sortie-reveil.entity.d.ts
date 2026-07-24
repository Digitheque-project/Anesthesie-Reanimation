import { ScoreSCCRE } from './score-sccre.entity';
export declare enum StatutSortieReveil {
    EN_ATTENTE = "EN_ATTENTE",
    VALIDE = "VALIDE"
}
export declare class SortieReveil {
    id: string;
    patientId: string;
    scoreSCCRE: ScoreSCCRE;
    scoreSCCREId: string;
    medecinId: string;
    dateHeureSortie: Date;
    versServiceOrigine: boolean;
    autresServicesDestination: string[];
    checklistSortie: {
        signesVitauxStables: boolean;
        douleurControlee: boolean;
        prescriptionsFaites: boolean;
        familleInformee: boolean;
    };
    statut: StatutSortieReveil;
    createdAt: Date;
    updatedAt: Date;
}
