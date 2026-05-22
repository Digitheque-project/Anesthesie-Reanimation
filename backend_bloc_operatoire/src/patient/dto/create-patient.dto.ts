import { IsString, IsEnum, IsDateString, IsOptional, Length } from 'class-validator';
import { PatientStatut, NiveauUrgence, Sexe } from '../../entities/patient.entity';

export class CreatePatientDto {
  // Champs obligatoires
  @IsString() @Length(2, 100) nom: string;
  @IsString() @Length(2, 100) prenom: string;
  @IsDateString() dateNaissance: string;
  @IsEnum(Sexe) sexe: Sexe;
  @IsString() @Length(8, 20) telephone: string;
  @IsString() adresse: string;
  @IsString() @Length(3, 50) idDossier: string;
  @IsString() groupeSanguin: string;

  // Dossier médical obligatoire
  @IsString() libelle: string;
  @IsString() risqueHemorragique: string;
  @IsString() typeChirurgie: string;
  @IsString() consignes: string;
  @IsDateString() dateIntervention: string;
  @IsString() alertes: string;
  @IsString() prescripteurId: string;
  @IsString() chirurgien_nom: string;
  @IsEnum(NiveauUrgence) niveauUrgence: NiveauUrgence;

  // Optionnels
  @IsOptional() @IsEnum(PatientStatut) statut?: PatientStatut;
  @IsOptional() @IsString() chambre?: string;
}
