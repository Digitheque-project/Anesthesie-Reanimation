import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { CreatePatientDto } from './create-patient.dto';
import { PatientStatut, NiveauUrgence } from '../../entities/patient.entity';

export class UpdatePatientDto extends PartialType(CreatePatientDto) {
  @IsOptional()
  @IsEnum(PatientStatut)
  statut?: PatientStatut;

  @IsOptional()
  @IsEnum(NiveauUrgence)
  niveauUrgence?: NiveauUrgence;

  @IsOptional()
  @IsString()
  chambre?: string;
}
