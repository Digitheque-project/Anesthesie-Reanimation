import {
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  Length,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  PatientStatut,
  NiveauUrgence,
} from '../../entities/patient-bloc.entity';
import { RegisterPatientDto } from '../../external/dto/register-patient.dto';

export class RegisterAndAdmitPatientDto {
  @ValidateNested()
  @Type(() => RegisterPatientDto)
  identite: RegisterPatientDto;

  @IsString() @Length(3, 50) idDossier: string;
  @IsString() groupeSanguin: string;

  @IsString() libelle: string;
  @IsString() risqueHemorragique: string;
  @IsString() typeChirurgie: string;
  @IsString() consignes: string;
  @IsDateString() dateIntervention: string;
  @IsString() alertes: string;
  @IsString() prescripteurId: string;
  @IsString() chirurgien_nom: string;
  @IsEnum(NiveauUrgence) niveauUrgence: NiveauUrgence;

  @IsOptional() @IsEnum(PatientStatut) statut?: PatientStatut;
  @IsOptional() @IsString() chambre?: string;
}
