import { IsString, IsDateString, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { StatutChecklist } from '../../entities/checklist-apres-op.entity';

export class CreateChecklistApresOpDto {
  @IsString() patientId: string;
  @IsDateString() dateCreation: string;
  @IsOptional() @IsBoolean() interventionEnregistree?: boolean;
  @IsOptional() @IsBoolean() compteFinalCorrect?: boolean;
  @IsOptional() @IsBoolean() etiquetageVerifie?: boolean;
  @IsOptional() @IsBoolean() signalementsEffectues?: boolean;
  @IsOptional() @IsBoolean() transfertSalleReveil?: boolean;
  @IsOptional() @IsString() observationsParticulieres?: string;
  @IsOptional() @IsEnum(StatutChecklist) statut?: StatutChecklist;
}
