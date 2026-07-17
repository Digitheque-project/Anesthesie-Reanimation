import { IsString, IsOptional, IsInt, IsDateString, IsUrl, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReceiveDemandeCpaDto {
  @ApiProperty({ description: 'Identifiant du patient (identique à celui utilisé par le service Accueil).', example: 'CHU-2026-00099' })
  @IsString() patientId: string;

  @ApiProperty({ description: 'Identifiant du service demandeur (tel qu\'enregistré dans le registre central des services).', example: 'a6ae8016-678c-4e13-b9d7-0afd735702d8' })
  @IsString() sourceServiceId: string;

  @ApiPropertyOptional({ description: 'Nom lisible du service demandeur, à titre d\'affichage.', example: 'Endoscopie' })
  @IsOptional() @IsString() sourceServiceName?: string;

  @ApiPropertyOptional({
    description:
      "URL complète à laquelle POSTer le résultat de la CPA/VPA une fois réalisée (recommandé). " +
      "Le Bloc Opératoire y enverra un POST JSON { type: 'CPA_RESULTAT'|'VPA_REALISEE', patientId, entiteRefType, entiteRefId, payload, ... } " +
      "dès que la décision est rendue. Sans cette URL, le résultat n'est pas transmis automatiquement (sauf intégration historique Endoscopie).",
    example: 'https://mon-service.exemple.com/notifications/receive',
  })
  @IsOptional() @IsUrl({ require_tld: false }) sourceCallbackUrl?: string;

  @ApiProperty({ description: 'Type de référence métier côté service demandeur (ex: "examen", "consultation").', example: 'examen' })
  @IsString() sourceReferenceType: string;

  @ApiProperty({ description: 'Identifiant de cette référence côté service demandeur — renvoyé tel quel dans le callback de résultat pour corrélation.', example: 'EXM-2026-0456' })
  @IsString() sourceReferenceId: string;

  @ApiProperty({ description: "Type d'anesthésie envisagé pour l'acte.", example: 'Sédation' })
  @IsString() typeAnesthesie: string;

  @ApiPropertyOptional({ description: 'Motif de la demande de CPA/VPA.', example: 'Coloscopie sous sédation' })
  @IsOptional() @IsString() motif?: string;

  @ApiPropertyOptional({ description: "Niveau d'urgence, de 1 (faible) à 5 (STAT/immédiat).", example: 2, minimum: 1, maximum: 5 })
  @IsOptional() @IsInt() @Min(1) @Max(5) urgence?: number;

  @ApiPropertyOptional({ description: "Date souhaitée pour l'examen/acte (indicative pour la planification CPA).", example: '2026-08-01' })
  @IsOptional() @IsDateString() dateExamenSouhaitee?: string;
}
