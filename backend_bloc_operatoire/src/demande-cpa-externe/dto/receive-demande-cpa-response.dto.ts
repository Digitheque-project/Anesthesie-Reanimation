import { ApiProperty } from '@nestjs/swagger';
import { StatutDemandeCpaExterne } from '../../entities/demande-cpa-externe.entity';

export class ReceiveDemandeCpaResponseDto {
  @ApiProperty({ example: true })
  received: boolean;

  @ApiProperty({
    description: 'Identifiant de la demande créée — à conserver pour interroger GET /demandes-cpa-externes/:id/statut par la suite.',
    example: 'b3f1c9e0-1234-4a5b-8c9d-0e1f2a3b4c5d',
  })
  id: string;

  @ApiProperty({ enum: StatutDemandeCpaExterne, example: StatutDemandeCpaExterne.EN_ATTENTE })
  statut: StatutDemandeCpaExterne;

  @ApiProperty({ example: '2026-07-28T10:00:00.000Z' })
  timestamp: string;
}
