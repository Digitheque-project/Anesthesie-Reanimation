import {
  IsString,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsArray,
  IsObject,
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
  @IsOptional() @IsEnum(['DOSAGE', 'QUANTITE']) mode?: 'DOSAGE' | 'QUANTITE';
  @IsOptional() @IsString() dosage?: string;
  @IsOptional() @IsNumber() nombre?: number;
}

export class CreateCPADto {
  @IsString() patientId: string;
  // Si l'utilisateur connecté est l'ANESTHESISTE, dérivé automatiquement de sa session (ignoré
  // s'il est envoyé) — voir CPAService.create. Si l'utilisateur connecté est RESPONSABLE_CPA ou
  // MAJOR (n'ayant pas de fiche Médecin propre), ce champ devient obligatoire.
  @IsOptional() @IsString() anesthesisteId?: string;
  @IsDateString() dateConsultation: string;

  // Antécédents (section 1 de la fiche papier) — tous optionnels, comme le reste de l'examen
  // clinique : seule la décision finale est bloquante à la validation.
  @IsOptional() @IsString() histoireActuelle?: string;
  @IsOptional() @IsString() dernierRepasBoisson?: string;
  @IsOptional() @IsBoolean() patientMineur?: boolean;
  @IsOptional() @IsBoolean() autorisationOpererSignee?: boolean;
  @IsBoolean() antecedentsAnesthesie: boolean;
  @IsOptional() @IsString() atcdMedicaux?: string;
  @IsOptional() @IsString() atcdChirurgicaux?: string;
  @IsOptional() @IsString() notesIncidents?: string;
  @IsOptional() @IsBoolean() asthme?: boolean;
  @IsOptional() @IsEnum(['NORMAL', 'ALLONGE']) tempsSaignement?: 'NORMAL' | 'ALLONGE';
  // Objets à forme libre (G/P/A/DDR, groupe/phénotype/RAI, numération/ionogramme) : validation
  // volontairement souple (IsObject seul), ce sont des recopies de résultats externes, jamais de
  // saisie bloquante.
  @IsOptional() @IsObject() atcdObstetricaux?: { g?: string; p?: string; a?: string; ddr?: string };
  @IsOptional() @IsString() allergiesMedicamenteuses?: string;
  @IsOptional() @IsString() allergiesAutres?: string;
  @IsOptional() @IsString() contraception?: string;
  @IsOptional() @IsObject() groupeSanguinCpa?: { groupe?: string; phenotype?: string; rai?: string };
  @IsOptional() @IsString() atcdFamiliaux?: string;
  @IsOptional() @IsBoolean() transfusionsAnterieures?: boolean;
  @IsOptional() @IsString() transfusionsIncidents?: string;
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
  // Bilan biologique / paraclinique (section 3 de la fiche papier).
  @IsOptional() @IsObject() bilanBiologique?: Record<string, string>;
  @IsOptional() @IsString() ecg?: string;
  @IsOptional() @IsString() radioPulmonaire?: string;
  @IsOptional() @IsString() echographie?: string;
  @IsOptional() @IsString() scanner?: string;
  @IsOptional() @IsString() autresExamensParacliniques?: string;
  @IsEnum(ScoreASA) scoreASA: ScoreASA;
  @IsEnum(DecisionCPA) decision: DecisionCPA;
  // Conclusion (section 4 de la fiche papier).
  @IsOptional() @IsString() traitementEnCours?: string;
  @IsOptional() @IsString() traitementASuivre?: string;
  @IsOptional() @IsString() conclusion?: string;
  @IsOptional() @IsString() recommandationsProtocole?: string;
  @IsString() typeAnesthesie: string;
  @IsOptional() @IsString() sousTypeAnesthesie?: string;
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
