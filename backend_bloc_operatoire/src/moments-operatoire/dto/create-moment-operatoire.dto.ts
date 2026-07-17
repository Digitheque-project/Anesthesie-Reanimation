import { IsString, IsEnum, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { CategorieMoment } from '../../entities/moment-operatoire.entity';

export class CreateMomentOperatoireDto {
  @IsString() patientId: string;
  @IsString() label: string;
  @IsEnum(CategorieMoment) categorie: CategorieMoment;
  @IsOptional() @IsBoolean() estPersonnalise?: boolean;
  // ISO 8601 avec millisecondes, capturé côté client au moment du tap.
  @IsDateString() horodatage: string;
}
