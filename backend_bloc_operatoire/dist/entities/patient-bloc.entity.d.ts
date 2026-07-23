export declare enum PatientStatut {
    EN_ATTENTE_CPA = "EN_ATTENTE_CPA",
    CPA_REALISE = "CPA_REALISE",
    CPA_INAPTE = "CPA_INAPTE",
    EN_ATTENTE_VERIFICATION_VEILLE = "EN_ATTENTE_VERIFICATION_VEILLE",
    VERIFICATION_VEILLE_REALISEE = "VERIFICATION_VEILLE_REALISEE",
    PRET_POUR_BLOC = "PRET_POUR_BLOC",
    EN_COURS_OPERATION = "EN_COURS_OPERATION",
    EN_SALLE_REVEIL = "EN_SALLE_REVEIL",
    SORTI = "SORTI"
}
export declare enum NiveauUrgence {
    TRES_URGENT = "TRES_URGENT",
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
    motifRefusCpa: string | null;
    prescriptionExterneId: string | null;
    createdAt: Date;
    updatedAt: Date;
}
