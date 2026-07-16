export declare enum PatientStatut {
    EN_ATTENTE_CPA = "EN_ATTENTE_CPA",
    CPA_REALISE = "CPA_REALISE",
    CPA_INAPTE = "CPA_INAPTE",
    EN_ATTENTE_VPA = "EN_ATTENTE_VPA",
    VPA_REALISE = "VPA_REALISE",
    PRET_POUR_BLOC = "PRET_POUR_BLOC",
    EN_COURS_OPERATION = "EN_COURS_OPERATION",
    EN_SALLE_REVEIL = "EN_SALLE_REVEIL",
    SORTI = "SORTI"
}
export declare enum NiveauUrgence {
    STAT = "STAT",
    URGENT = "URGENT",
    NORMAL = "NORMAL"
}
export declare class PatientBloc {
    patientId: string;
    chuId: string;
    idDossier: string;
    groupeSanguin: string;
    libelle: string;
    risqueHemorragique: string;
    typeChirurgie: string;
    consignes: string;
    dateIntervention: Date;
    alertes: string;
    prescripteurId: string;
    chirurgien_nom: string;
    statut: PatientStatut;
    niveauUrgence: NiveauUrgence;
    chambre: string;
    serviceOrigine: string | null;
    serviceOrigineId: string | null;
    createdAt: Date;
    updatedAt: Date;
}
