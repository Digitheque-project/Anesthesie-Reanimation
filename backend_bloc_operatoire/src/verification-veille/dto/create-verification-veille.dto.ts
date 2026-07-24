import {
  IsString,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsOptional,
  IsArray,
} from 'class-validator';
import { StatutVerificationVeille } from '../../entities/verification-veille.entity';

export class CreateVerificationVeilleDto {
  @IsString() patientId: string;
  @IsString() cpaId: string;
  @IsOptional() @IsString() anesthesisteId?: string;
  @IsDateString() dateVisite: string;
  @IsBoolean() identiteConfirmee: boolean;
  @IsBoolean() jeuneRespected: boolean;
  @IsBoolean() instructionsRespectees: boolean;
  @IsBoolean() premedicationFaite: boolean;
  @IsString() jeune: string;
  @IsString() examensComplementaires: string;
  @IsOptional() commandeSang?: any;
  @IsString() heureDepart: string;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medicamentsVerifies?: string[];
  @IsOptional()
  @IsEnum(StatutVerificationVeille)
  statut?: StatutVerificationVeille;
}
