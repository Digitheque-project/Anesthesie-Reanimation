import { Medecin } from './medecin.entity';
import { Premedicament } from './premedicament.entity';
export declare enum ScoreASA {
    ASA_1 = 1,
    ASA_2 = 2,
    ASA_3 = 3,
    ASA_4 = 4,
    ASA_5 = 5,
    ASA_6 = 6,
    E = "E"
}
export declare enum DecisionCPA {
    APTE = "APTE",
    INAPTE = "INAPTE",
    REPORT = "REPORT"
}
export declare enum DecisionOperation {
    RETENUE = "RETENUE",
    REPORTEE = "REPORTEE",
    REFUSEE = "REFUSEE"
}
export declare enum StatutCPA {
    EN_ATTENTE = "EN_ATTENTE",
    REALISE = "REALISE"
}
export declare class CPA {
    id: string;
    patientId: string;
    anesthesiste: Medecin;
    anesthesisteId: string;
    dateConsultation: Date;
    antecedentsAnesthesie: boolean;
    notesIncidents: string;
    frequenceCardiaque: number | null;
    tensionArterielle: {
        systolique: number;
        diastolique: number;
    } | null;
    taille: number | null;
    poids: number | null;
    examenCardiovasculaire: string;
    examenPulmonaire: string;
    examenNeurologique: string;
    colorationConjonctivale: string;
    abordVeineux: string;
    rachis: string;
    mallampati: number | null;
    ouvertureBuccale: number | null;
    distanceMentoThyroidienne: number | null;
    dents: string;
    tabac: string;
    alcool: string;
    scoreASA: ScoreASA;
    decision: DecisionCPA;
    motifRefus: string;
    decisionOperation: DecisionOperation | null;
    validationProfInformelle: string;
    typeAnesthesie: string;
    techniqueIntubation: string;
    premedicaments: Premedicament[];
    medicamentsAnesthesieReanimation: {
        categorie: string;
        nom: string;
        dosage?: string;
        observation?: string;
    }[];
    jeune: string;
    preparationPhysique: string;
    tachesInfirmieres: string;
    dateVerificationVeille: Date;
    statut: StatutCPA;
    createdAt: Date;
    updatedAt: Date;
}
