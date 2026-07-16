import { ScoreASA, DecisionCPA, StatutCPA } from '../../entities/cpa.entity';
declare class PremedicamentDto {
    nom: string;
    dose: string;
    voieAdministration: string;
    debut: string;
    frequence: string;
}
export declare class CreateCPADto {
    patientId: string;
    anesthesisteId: string;
    dateConsultation: string;
    antecedentsAnesthesie: boolean;
    notesIncidents?: string;
    frequenceCardiaque: number;
    tensionArterielle: {
        systolique: number;
        diastolique: number;
    };
    taille: number;
    poids: number;
    examenCardiovasculaire: string;
    examenPulmonaire: string;
    examenNeurologique: string;
    colorationConjonctivale: string;
    abordVeineux: string;
    rachis: string;
    mallampati: number;
    ouvertureBuccale: number;
    distanceMentoThyroidienne: number;
    dents: string;
    tabac: string;
    alcool: string;
    scoreASA: ScoreASA;
    decision: DecisionCPA;
    typeAnesthesie: string;
    techniqueIntubation: string;
    premedicaments?: PremedicamentDto[];
    jeune: string;
    preparationPhysique: string;
    tachesInfirmieres: string;
    dateVPA?: string;
    statut?: StatutCPA;
    motifRefus?: string;
}
export {};
