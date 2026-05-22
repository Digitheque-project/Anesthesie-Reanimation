import { IsString, IsEnum, IsDateString, IsBoolean, IsOptional } from 'class-validator';
import { StatutVPA } from '../../entities/vpa.entity';

export class CreateVPADto {
  @IsOptional() @IsString() patientId?: string;
  @IsOptional() @IsString() cpaId?: string;
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
  @IsOptional() @IsEnum(StatutVPA) statut?: StatutVPA;
}
