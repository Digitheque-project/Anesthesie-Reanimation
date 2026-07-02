import { PatientStatut, NiveauUrgence } from '../../entities/patient-bloc.entity';
export declare class AdmitExistingPatientDto {
    patientId: string;
    idDossier: string;
    groupeSanguin: string;
    libelle: string;
    risqueHemorragique: string;
    typeChirurgie: string;
    consignes: string;
    dateIntervention: string;
    alertes: string;
    prescripteurId: string;
    chirurgien_nom: string;
    niveauUrgence: NiveauUrgence;
    statut?: PatientStatut;
    chambre?: string;
}
