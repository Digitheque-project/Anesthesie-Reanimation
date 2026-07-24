export declare enum StatutScoreSCCRE {
    EN_COURS = "EN_COURS",
    VALIDE = "VALIDE"
}
export declare class ScoreSCCRE {
    id: string;
    patientId: string;
    anesthesisteId: string;
    heureArrivee: string;
    dateEvaluation: Date;
    motricite: number;
    respiration: number;
    pressionArterielle: number;
    etatConscience: number;
    coloration: number;
    scoreTotal: number;
    calculerScoreTotal(): void;
    evs: number;
    eqa: number;
    eva: number;
    etatInitial: {
        intubation: boolean;
        curarisation: boolean;
    };
    reponse: {
        intubation: boolean;
        curarisation: boolean;
    };
    sortieAutorisee: boolean;
    statut: StatutScoreSCCRE;
    createdAt: Date;
    updatedAt: Date;
}
