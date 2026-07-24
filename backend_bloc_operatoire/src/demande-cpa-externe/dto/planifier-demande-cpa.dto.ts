import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TypeRDV } from '../../entities/creneau-bloc.entity';

export class PlanifierDemandeCpaDto {
  @ApiPropertyOptional({
    enum: TypeRDV,
    description:
      "CPA (défaut) pour la consultation initiale, VERIFICATION_VEILLE pour le contrôle la veille de l'intervention.",
    default: TypeRDV.CPA,
  })
  @IsOptional()
  @IsEnum(TypeRDV)
  type?: TypeRDV;

  @ApiProperty({ example: '2026-08-01' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  heureDebut: string;

  @ApiProperty({ example: '09:30' })
  @IsString()
  heureFin: string;

  @ApiProperty({ example: 'Salle CPA-1' })
  @IsString()
  salle: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chirurgienId?: string;

  @ApiPropertyOptional({
    description: "Nom libre du responsable si aucun médecin n'est sélectionné.",
  })
  @IsOptional()
  @IsString()
  responsable?: string;
}
