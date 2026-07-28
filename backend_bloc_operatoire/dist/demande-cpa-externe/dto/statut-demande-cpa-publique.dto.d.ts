import { StatutDemandeCpaExterne } from '../../entities/demande-cpa-externe.entity';
export declare class StatutDemandeCpaPubliqueDto {
    id: string;
    patientId: string;
    sourceReferenceId: string;
    statut: StatutDemandeCpaExterne;
    cpaId: string | null;
    vpaId: string | null;
    dateCpaPlanifiee: Date | null;
    dateVpaPlanifiee: Date | null;
    decision: string | null;
    dateCpa: Date | null;
    observations: string | null;
    motifRefus: string | null;
}
