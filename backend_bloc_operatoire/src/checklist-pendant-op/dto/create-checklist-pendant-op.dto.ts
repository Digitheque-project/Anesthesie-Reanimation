import {
  IsString,
  IsDateString,
  IsBoolean,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { StatutChecklist } from '../../entities/checklist-pendant-op.entity';

export class CreateChecklistPendantOpDto {
  @IsString() patientId: string;
  @IsDateString() dateCreation: string;
  @IsOptional() @IsBoolean() identiteUltimeConfirmee?: boolean;
  @IsOptional() @IsBoolean() interventionConfirmee?: boolean;
  @IsOptional() @IsBoolean() siteOperatoireConfirme?: boolean;
  @IsOptional() @IsBoolean() installationCorrecte?: boolean;
  @IsOptional() @IsBoolean() documentsDisponibles?: boolean;
  @IsOptional() @IsBoolean() antibioprophylaxieFaite?: boolean;
  @IsOptional() @IsBoolean() constantesStables?: boolean;
  @IsOptional() @IsBoolean() ventilationOK?: boolean;
  @IsOptional() @IsEnum(StatutChecklist) statut?: StatutChecklist;
}
