import {
  IsString,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ScoreASA,
  DecisionCPA,
  StatutCPA,
  DecisionOperation,
} from '../../entities/cpa.entity';

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
  @IsString() categorie: string;
  @IsString() nom: string;
  @IsOptional() @IsString() dosage?: string;
  @IsOptional() @IsString() observation?: string;
}

export class CreateCPADto {
  @IsString() patientId: string;
  // Si l'utilisateur connecté est l'ANESTHESISTE, dérivé automatiquement de sa session (ignoré
  // s'il est envoyé) — voir CPAService.create. Si l'utilisateur connecté est RESPONSABLE_CPA ou
  // MAJOR (n'ayant pas de fiche Médecin propre), ce champ devient obligatoire.
  @IsOptional() @IsString() anesthesisteId?: string;
  @IsDateString() dateConsultation: string;
  @IsBoolean() antecedentsAnesthesie: boolean;
  @IsOptional() @IsString() notesIncidents?: string;
  // Mesures cliniques non bloquantes : seule la décision finale est obligatoire à la validation.
  @IsOptional() @IsNumber() frequenceCardiaque?: number;
  @IsOptional()
  @ValidateNested()
  @Type(() => TensionArterielleDto)
  tensionArterielle?: { systolique: number; diastolique: number };
  @IsOptional() @IsNumber() taille?: number;
  @IsOptional() @IsNumber() poids?: number;
  @IsString() examenCardiovasculaire: string;
  @IsString() examenPulmonaire: string;
  @IsString() examenNeurologique: string;
  @IsString() colorationConjonctivale: string;
  @IsString() abordVeineux: string;
  @IsString() rachis: string;
  @IsOptional() @IsNumber() mallampati?: number;
  @IsOptional() @IsNumber() ouvertureBuccale?: number;
  @IsOptional() @IsNumber() distanceMentoThyroidienne?: number;
  @IsString() dents: string;
  @IsString() tabac: string;
  @IsString() alcool: string;
  @IsEnum(ScoreASA) scoreASA: ScoreASA;
  @IsEnum(DecisionCPA) decision: DecisionCPA;
  @IsString() typeAnesthesie: string;
  @IsString() techniqueIntubation: string;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PremedicamentDto)
  premedicaments?: PremedicamentDto[];
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicamentAnesthesieReanimationDto)
  medicamentsAnesthesieReanimation?: MedicamentAnesthesieReanimationDto[];
  @IsString() jeune: string;
  @IsString() preparationPhysique: string;
  @IsString() tachesInfirmieres: string;
  @IsOptional() @IsDateString() dateVerificationVeille?: string;
  @IsOptional() @IsEnum(StatutCPA) statut?: StatutCPA;
  @IsOptional() @IsString() motifRefus?: string;
  @IsOptional()
  @IsEnum(DecisionOperation)
  decisionOperation?: DecisionOperation;
  @IsOptional() @IsString() validationProfInformelle?: string;
}
