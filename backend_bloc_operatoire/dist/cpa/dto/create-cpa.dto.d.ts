import { ScoreASA, DecisionCPA, StatutCPA, DecisionOperation } from '../../entities/cpa.entity';
declare class PremedicamentDto {
    nom: string;
    dose: string;
    voieAdministration: string;
    debut: string;
    frequence: string;
}
declare class MedicamentAnesthesieReanimationDto {
    categorie: string;
    nom: string;
    mode?: 'DOSAGE' | 'QUANTITE';
    dosage?: string;
    nombre?: number;
}
export declare class CreateCPADto {
    patientId: string;
    anesthesisteId?: string;
    dateConsultation: string;
    histoireActuelle?: string;
    dernierRepasBoisson?: string;
    patientMineur?: boolean;
    autorisationOpererSignee?: boolean;
    antecedentsAnesthesie: boolean;
    atcdMedicaux?: string;
    atcdChirurgicaux?: string;
    notesIncidents?: string;
    asthme?: boolean;
    tempsSaignement?: 'NORMAL' | 'ALLONGE';
    atcdObstetricaux?: {
        g?: string;
        p?: string;
        a?: string;
        ddr?: string;
    };
    allergiesMedicamenteuses?: string;
    allergiesAutres?: string;
    contraception?: string;
    groupeSanguinCpa?: {
        groupe?: string;
        phenotype?: string;
        rai?: string;
    };
    atcdFamiliaux?: string;
    transfusionsAnterieures?: boolean;
    transfusionsIncidents?: string;
    frequenceCardiaque?: number;
    tensionArterielle?: {
        systolique: number;
        diastolique: number;
    };
    taille?: number;
    poids?: number;
    examenCardiovasculaire: string;
    examenPulmonaire: string;
    examenNeurologique: string;
    colorationConjonctivale: string;
    abordVeineux: string;
    rachis: string;
    mallampati?: number;
    ouvertureBuccale?: number;
    distanceMentoThyroidienne?: number;
    dents: string;
    tabac: string;
    alcool: string;
    bilanBiologique?: Record<string, string>;
    ecg?: string;
    radioPulmonaire?: string;
    echographie?: string;
    scanner?: string;
    autresExamensParacliniques?: string;
    scoreASA: ScoreASA;
    decision: DecisionCPA;
    traitementEnCours?: string;
    traitementASuivre?: string;
    conclusion?: string;
    recommandationsProtocole?: string;
    typeAnesthesie: string;
    sousTypeAnesthesie?: string;
    techniqueIntubation: string;
    premedicaments?: PremedicamentDto[];
    medicamentsAnesthesieReanimation?: MedicamentAnesthesieReanimationDto[];
    jeune: string;
    preparationPhysique: string;
    tachesInfirmieres: string;
    dateVerificationVeille?: string;
    statut?: StatutCPA;
    motifRefus?: string;
    decisionOperation?: DecisionOperation;
    validationProfInformelle?: string;
}
export {};
