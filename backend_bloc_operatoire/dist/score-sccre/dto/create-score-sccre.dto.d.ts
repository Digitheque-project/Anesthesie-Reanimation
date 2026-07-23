import { StatutScoreSCCRE } from '../../entities/score-sccre.entity';
export declare class CreateScoreSCCREDto {
    patientId: string;
    anesthesisteId?: string;
    heureArrivee: string;
    dateEvaluation: string;
    motricite: number;
    respiration: number;
    pressionArterielle: number;
    etatConscience: number;
    coloration: number;
    evs: number;
    eqa: number;
    eva: number;
    etatInitial?: {
        intubation: boolean;
        curarisation: boolean;
    };
    reponse?: {
        intubation: boolean;
        curarisation: boolean;
    };
    sortieAutorisee: boolean;
    statut?: StatutScoreSCCRE;
}
