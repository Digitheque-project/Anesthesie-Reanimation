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
    anesthesisteId: string | null;
    saisiParId: string | null;
    saisiParRole: string | null;
    dateConsultation: Date;
    histoireActuelle: string | null;
    dernierRepasBoisson: string | null;
    patientMineur: boolean;
    autorisationOpererSignee: boolean;
    antecedentsAnesthesie: boolean;
    atcdMedicaux: string | null;
    atcdChirurgicaux: string | null;
    notesIncidents: string;
    asthme: boolean;
    tempsSaignement: 'NORMAL' | 'ALLONGE' | null;
    atcdObstetricaux: {
        g?: string;
        p?: string;
        a?: string;
        ddr?: string;
    } | null;
    allergiesMedicamenteuses: string | null;
    allergiesAutres: string | null;
    contraception: string | null;
    groupeSanguinCpa: {
        groupe?: string;
        phenotype?: string;
        rai?: string;
    } | null;
    atcdFamiliaux: string | null;
    transfusionsAnterieures: boolean;
    transfusionsIncidents: string | null;
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
    bilanBiologique: Record<string, string> | null;
    ecg: string | null;
    radioPulmonaire: string | null;
    echographie: string | null;
    scanner: string | null;
    autresExamensParacliniques: string | null;
    scoreASA: ScoreASA;
    decision: DecisionCPA;
    motifRefus: string;
    decisionOperation: DecisionOperation | null;
    validationProfInformelle: string;
    traitementEnCours: string | null;
    traitementASuivre: string | null;
    conclusion: string | null;
    recommandationsProtocole: string | null;
    typeAnesthesie: string;
    sousTypeAnesthesie: string | null;
    techniqueIntubation: string;
    premedicaments: Premedicament[];
    medicamentsAnesthesieReanimation: {
        categorie: string;
        nom: string;
        mode?: 'DOSAGE' | 'QUANTITE';
        dosage?: string;
        nombre?: number;
    }[];
    jeune: string;
    preparationPhysique: string;
    tachesInfirmieres: string;
    dateVerificationVeille: Date;
    statut: StatutCPA;
    createdAt: Date;
    updatedAt: Date;
}
