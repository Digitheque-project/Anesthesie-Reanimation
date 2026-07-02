import { PatientStatut, NiveauUrgence } from '../../entities/patient-bloc.entity';
import { RegisterPatientDto } from '../../external/dto/register-patient.dto';
export declare class RegisterAndAdmitPatientDto {
    identite: RegisterPatientDto;
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
