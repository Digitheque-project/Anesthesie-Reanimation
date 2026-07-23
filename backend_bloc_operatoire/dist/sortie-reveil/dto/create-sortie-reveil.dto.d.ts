import { StatutSortieReveil } from '../../entities/sortie-reveil.entity';
export declare class CreateSortieReveilDto {
    patientId: string;
    scoreSCCREId: string;
    medecinId?: string;
    dateHeureSortie: string;
    versServiceOrigine: boolean;
    autresServicesDestination?: string[];
    checklistSortie: {
        signesVitauxStables: boolean;
        douleurControlee: boolean;
        prescriptionsFaites: boolean;
        familleInformee: boolean;
    };
    statut?: StatutSortieReveil;
}
