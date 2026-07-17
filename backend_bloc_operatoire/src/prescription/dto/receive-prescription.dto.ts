import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class ItemPrescriptionDto {
  @ApiProperty({ example: 'Doliprane', description: 'Nom du médicament/produit' })
  @IsString() nom: string;

  @ApiProperty({ example: '500mg', description: 'Dosage' })
  @IsString() dosage: string;

  @ApiProperty({ example: '2 fois par jour', description: 'Posologie' })
  @IsString() posologie: string;

  @ApiProperty({ example: 5, description: 'Durée en jours' })
  @IsNumber() duree: number;
}

export class ReceivePrescriptionDto {
  @ApiProperty({ example: 'P-2026-001', description: 'ID de la prescription source' })
  @IsString() idPrescriptionSource: string;

  @ApiProperty({ example: 'PATIENT-001', description: 'ID patient dans le service Prescription' })
  @IsString() patientIdSource: string;

  @ApiProperty({ example: 'patient-uuid-block', description: 'ID patient dans le Bloc Opératoire' })
  @IsString() patientId: string;

  @ApiProperty({
    enum: ['MEDICALE', 'BLOC', 'LABO', 'IMAGERIE', 'ANAPATH', 'EEG', 'KINE', 'DIALYSE', 'ENDOSCOPIE', 'NON_MEDICALE', 'SURVEILLANCE', 'TRANSFUSION'],
    example: 'BLOC',
    description: 'Type de prescription',
  })
  @IsString() type: string;

  @ApiProperty({ type: [ItemPrescriptionDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => ItemPrescriptionDto)
  items: ItemPrescriptionDto[];

  @ApiProperty({ example: 'Dr. Rakoto', description: 'Prescripteur' })
  @IsString() prescripteur: string;

  @ApiProperty({ example: '2026-06-15T10:00:00Z' })
  @IsString() datePrescription: string;

  @ApiProperty({ required: false, description: 'Informations supplémentaires' })
  @IsOptional() metadata?: any;
}
