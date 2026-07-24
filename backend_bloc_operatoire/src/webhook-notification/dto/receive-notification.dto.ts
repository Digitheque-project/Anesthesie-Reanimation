import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class ReceiveNotificationDto {
  @ApiProperty({
    example: 'MEDICAL_ALERT',
    description: 'Type de notification',
  })
  @IsString()
  type: string;

  @ApiProperty({
    example: 'Patient en détresse',
    description: 'Motif de la notification',
  })
  @IsOptional()
  @IsString()
  motif?: string;

  @ApiProperty({
    example: 'service-bloc-operatoire',
    description: 'ID du service source',
  })
  @IsString()
  sourceServiceId: string;

  @ApiProperty({
    example: 'Bloc opératoire',
    description: 'Nom du service source',
  })
  @IsOptional()
  @IsString()
  sourceServiceName?: string;

  @ApiProperty({
    example: 'service-urgence',
    description: 'ID du service cible',
  })
  @IsOptional()
  @IsString()
  targetServiceId?: string;

  @ApiProperty({ example: 'Urgence', description: 'Nom du service cible' })
  @IsOptional()
  @IsString()
  targetServiceName?: string;

  @ApiProperty({
    example: 2,
    description: "Niveau d'urgence (1 = faible, 2 = moyen, 3 = élevé)",
  })
  @IsOptional()
  @IsNumber()
  urgence?: number;

  @ApiProperty({
    example: 'patient-123',
    description: 'ID du patient concerné',
  })
  @IsOptional()
  @IsString()
  patientId?: string;

  @ApiProperty({
    example: { salle: 'A123', operation: 'appendicectomie' },
    description: 'Données supplémentaires',
  })
  @IsOptional()
  payload?: any;

  @ApiProperty({
    example: ['SOUND', 'WEB'],
    description: 'Canaux de notification',
  })
  @IsOptional()
  @IsArray()
  channels?: string[];
}
