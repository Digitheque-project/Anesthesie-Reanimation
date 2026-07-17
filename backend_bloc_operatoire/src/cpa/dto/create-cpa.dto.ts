import { IsString, IsEnum, IsDateString, IsBoolean, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ScoreASA, DecisionCPA, StatutCPA } from '../../entities/cpa.entity';

class TensionArterielleDto {
  @IsNumber() systolique: number;
  @IsNumber() diastolique: number;
}
class PremedicamentDto {
  @IsString() nom: string;
  @IsString() dose: string;
  @IsString() voieAdministration: string;
  @IsString() debut: string;
  @IsString() frequence: string;
}
class MedicamentAnesthesieReanimationDto {
  @IsString() nom: string;
  @IsString() dose: string;
  @IsOptional() @IsString() voieAdministration?: string;
}

export class CreateCPADto {
  @IsString() patientId: string;
  // Dérivé automatiquement de l'utilisateur SSO connecté (voir CPAService.create) — ignoré s'il
  // est envoyé par le client.
  @IsOptional() @IsString() anesthesisteId?: string;
  @IsDateString() dateConsultation: string;
  @IsBoolean() antecedentsAnesthesie: boolean;
  @IsOptional() @IsString() notesIncidents?: string;
  @IsNumber() frequenceCardiaque: number;
  @ValidateNested() @Type(() => TensionArterielleDto) tensionArterielle: { systolique: number; diastolique: number };
  @IsNumber() taille: number;
  @IsNumber() poids: number;
  @IsString() examenCardiovasculaire: string;
  @IsString() examenPulmonaire: string;
  @IsString() examenNeurologique: string;
  @IsString() colorationConjonctivale: string;
  @IsString() abordVeineux: string;
  @IsString() rachis: string;
  @IsNumber() mallampati: number;
  @IsNumber() ouvertureBuccale: number;
  @IsNumber() distanceMentoThyroidienne: number;
  @IsString() dents: string;
  @IsString() tabac: string;
  @IsString() alcool: string;
  @IsEnum(ScoreASA) scoreASA: ScoreASA;
  @IsEnum(DecisionCPA) decision: DecisionCPA;
  @IsString() typeAnesthesie: string;
  @IsString() techniqueIntubation: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => PremedicamentDto) premedicaments?: PremedicamentDto[];
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => MedicamentAnesthesieReanimationDto) medicamentsAnesthesieReanimation?: MedicamentAnesthesieReanimationDto[];
  @IsString() jeune: string;
  @IsString() preparationPhysique: string;
  @IsString() tachesInfirmieres: string;
  @IsOptional() @IsDateString() dateVPA?: string;
  @IsOptional() @IsEnum(StatutCPA) statut?: StatutCPA;
  @IsOptional() @IsString() motifRefus?: string;
}
