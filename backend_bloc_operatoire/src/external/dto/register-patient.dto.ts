import { IsString, IsEnum, IsDateString, IsOptional, Length } from 'class-validator';

export enum SexeAccueil {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export class RegisterPatientDto {
  @IsString() @Length(2, 100) nom: string;
  @IsString() @Length(2, 100) prenom: string;
  @IsEnum(SexeAccueil) sexe: SexeAccueil;
  @IsDateString() dateNaissance: string;

  @IsOptional() @IsString() cin?: string;
  @IsOptional() @IsString() profession?: string;
  @IsOptional() @IsString() adresse?: string;
  @IsOptional() @IsString() telephone?: string;
  @IsOptional() @IsString() contactUrgence?: string;
  @IsOptional() @IsString() priseEnChargeId?: string;
}
