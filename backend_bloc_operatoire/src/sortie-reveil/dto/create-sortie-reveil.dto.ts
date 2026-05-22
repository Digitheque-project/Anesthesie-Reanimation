import { IsString, IsEnum, IsDateString, IsBoolean, IsArray, IsOptional } from 'class-validator';
import { StatutSortieReveil } from '../../entities/sortie-reveil.entity';

export class CreateSortieReveilDto {
  @IsString() patientId: string;
  @IsString() scoreSCCREId: string;
  @IsString() medecinId: string;
  @IsDateString() dateHeureSortie: string;
  @IsBoolean() versServiceOrigine: boolean;
  @IsOptional() @IsArray() @IsString({ each: true }) autresServicesDestination?: string[];
  checklistSortie: {
    signesVitauxStables: boolean;
    douleurControlee: boolean;
    prescriptionsFaites: boolean;
    familleInformee: boolean;
  };
  @IsOptional() @IsEnum(StatutSortieReveil) statut?: StatutSortieReveil;
}
