import {
  IsString,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsArray,
  IsOptional,
  IsDefined,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StatutSortieReveil } from '../../entities/sortie-reveil.entity';

// Sans décorateur de validation sur ses champs, ce sous-objet était silencieusement retiré du
// payload par le ValidationPipe global (whitelist: true) avant d'atteindre le service — la
// colonne checklistSortie étant non-nullable en base, chaque sortie de réveil échouait alors
// en erreur 500 non gérée (violation de contrainte SQL), jamais un message clair.
export class ChecklistSortieReveilDto {
  @IsBoolean() signesVitauxStables: boolean;
  @IsBoolean() douleurControlee: boolean;
  @IsBoolean() prescriptionsFaites: boolean;
  @IsBoolean() familleInformee: boolean;
}

export class CreateSortieReveilDto {
  @IsString() patientId: string;
  @IsString() scoreSCCREId: string;
  @IsOptional() @IsString() medecinId?: string;
  @IsDateString() dateHeureSortie: string;
  @IsBoolean() versServiceOrigine: boolean;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  autresServicesDestination?: string[];
  @IsDefined()
  @ValidateNested()
  @Type(() => ChecklistSortieReveilDto)
  checklistSortie: ChecklistSortieReveilDto;
  @IsOptional() @IsEnum(StatutSortieReveil) statut?: StatutSortieReveil;
}
