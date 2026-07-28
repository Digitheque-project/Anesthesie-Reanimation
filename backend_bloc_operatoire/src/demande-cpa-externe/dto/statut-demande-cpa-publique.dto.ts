import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatutDemandeCpaExterne } from '../../entities/demande-cpa-externe.entity';
import { DecisionCPA } from '../../entities/cpa.entity';

// Réponse de GET /demandes-cpa-externes/:id/statut (public) — uniquement le résultat, jamais le
// dossier CPA complet (antécédents, allergies, bilan biologique...), qui reste réservé au
// personnel du bloc.
export class StatutDemandeCpaPubliqueDto {
  @ApiProperty({ description: 'Identifiant de la demande (celui renvoyé par POST /receive).' })
  id: string;

  @ApiProperty({ description: "Identifiant du patient, tel que transmis à la création de la demande." })
  patientId: string;

  @ApiProperty({ description: 'Référence métier côté service demandeur (sourceReferenceId fourni à la création).' })
  sourceReferenceId: string;

  @ApiProperty({
    enum: StatutDemandeCpaExterne,
    description: 'État de la demande côté bloc (EN_ATTENTE, CPA_PLANIFIEE, CPA_REALISEE, VPA_PLANIFIEE, VPA_REALISEE, CONFIRMEE, REPORTEE, ANNULEE).',
  })
  statut: StatutDemandeCpaExterne;

  @ApiPropertyOptional({ description: 'Identifiant de la CPA une fois réalisée (interne au bloc, non consultable directement).', nullable: true })
  cpaId: string | null;

  @ApiPropertyOptional({ description: 'Identifiant de la vérification veille une fois réalisée (interne au bloc, non consultable directement).', nullable: true })
  vpaId: string | null;

  @ApiPropertyOptional({ description: 'Date/heure du rendez-vous CPA planifié, si applicable.', nullable: true })
  dateCpaPlanifiee: Date | null;

  @ApiPropertyOptional({ description: 'Date/heure du rendez-vous de vérification veille planifié, si applicable.', nullable: true })
  dateVpaPlanifiee: Date | null;

  @ApiPropertyOptional({
    enum: DecisionCPA,
    description: "Décision d'aptitude une fois la CPA réalisée (APTE/INAPTE/REPORT). null tant que non réalisée.",
    nullable: true,
  })
  decision: string | null;

  @ApiPropertyOptional({ description: 'Date de la consultation CPA réalisée. null tant que non réalisée.', nullable: true })
  dateCpa: Date | null;

  @ApiPropertyOptional({ description: "Observations/notes d'incidents saisies pendant la CPA. null tant que non réalisée.", nullable: true })
  observations: string | null;

  @ApiPropertyOptional({
    description: "Motif du refus ou du report — toujours renseigné quand decision vaut INAPTE ou REPORT, c'est l'information la plus importante à lire dans ces deux cas. null si APTE ou CPA non encore réalisée.",
    nullable: true,
  })
  motifRefus: string | null;
}
