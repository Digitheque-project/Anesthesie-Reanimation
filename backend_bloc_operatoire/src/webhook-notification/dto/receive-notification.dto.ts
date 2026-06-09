import { ApiProperty } from '@nestjs/swagger';

export class ReceiveNotificationDto {
  @ApiProperty({ example: 'MEDICAL_ALERT', description: 'Type de notification' })
  type: string;

  @ApiProperty({ example: 'Patient en détresse', description: 'Motif de la notification' })
  motif: string;

  @ApiProperty({ example: 'service-bloc-operatoire', description: 'ID du service source' })
  sourceServiceId: string;

  @ApiProperty({ example: 'Bloc opératoire', description: 'Nom du service source' })
  sourceServiceName: string;

  @ApiProperty({ example: 'service-urgence', description: 'ID du service cible' })
  targetServiceId: string;

  @ApiProperty({ example: 'Urgence', description: 'Nom du service cible' })
  targetServiceName: string;

  @ApiProperty({ example: 2, description: 'Niveau d\'urgence (1 = faible, 2 = moyen, 3 = élevé)' })
  urgence: number;

  @ApiProperty({ example: 'patient-123', description: 'ID du patient concerné' })
  patientId: string;

  @ApiProperty({ example: { salle: 'A123', operation: 'appendicectomie' }, description: 'Données supplémentaires' })
  payload: any;

  @ApiProperty({ example: ['SOUND', 'WEB'], description: 'Canaux de notification' })
  channels: string[];
}
