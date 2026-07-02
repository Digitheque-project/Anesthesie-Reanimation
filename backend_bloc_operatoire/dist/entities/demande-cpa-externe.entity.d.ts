export declare enum StatutDemandeCpaExterne {
    EN_ATTENTE = "EN_ATTENTE",
    CPA_PLANIFIEE = "CPA_PLANIFIEE",
    CPA_REALISEE = "CPA_REALISEE",
    VPA_PLANIFIEE = "VPA_PLANIFIEE",
    VPA_REALISEE = "VPA_REALISEE",
    CONFIRMEE = "CONFIRMEE",
    REPORTEE = "REPORTEE",
    ANNULEE = "ANNULEE"
}
export declare class DemandeCpaExterne {
    id: string;
    patientId: string;
    chuId: string;
    sourceServiceId: string;
    sourceServiceName: string;
    sourceReferenceType: string;
    sourceReferenceId: string;
    typeAnesthesie: string;
    motif: string;
    urgence: number;
    dateExamenSouhaitee: Date;
    statut: StatutDemandeCpaExterne;
    dateCpaPlanifiee: Date;
    dateVpaPlanifiee: Date;
    cpaId: string;
    vpaId: string;
    payload: any;
    createdAt: Date;
    updatedAt: Date;
}
