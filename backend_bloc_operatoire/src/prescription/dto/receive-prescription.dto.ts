import { ApiProperty } from '@nestjs/swagger';

class ItemPrescriptionDto {
  @ApiProperty({ example: 'Doliprane', description: 'Nom du médicament/produit' })
  nom: string;

  @ApiProperty({ example: '500mg', description: 'Dosage' })
  dosage: string;

  @ApiProperty({ example: '2 fois par jour', description: 'Posologie' })
  posologie: string;

  @ApiProperty({ example: 5, description: 'Durée en jours' })
  duree: number;
}

export class ReceivePrescriptionDto {
  @ApiProperty({ example: 'P-2026-001', description: 'ID de la prescription source' })
  idPrescriptionSource: string;

  @ApiProperty({ example: 'PATIENT-001', description: 'ID patient dans le service Prescription' })
  patientIdSource: string;

  @ApiProperty({ example: 'patient-uuid-block', description: 'ID patient dans le Bloc Opératoire' })
  patientId: string;

  @ApiProperty({ 
    enum: ['MEDICALE', 'BLOC', 'LABO', 'IMAGERIE', 'ANAPATH', 'EEG', 'KINE', 'DIALYSE', 'ENDOSCOPIE', 'NON_MEDICALE', 'SURVEILLANCE', 'TRANSFUSION'],
    example: 'BLOC',
    description: 'Type de prescription'
  })
  type: string;

  @ApiProperty({ type: [ItemPrescriptionDto] })
  items: ItemPrescriptionDto[];

  @ApiProperty({ example: 'Dr. Rakoto', description: 'Prescripteur' })
  prescripteur: string;

  @ApiProperty({ example: '2026-06-15T10:00:00Z' })
  datePrescription: string;

  @ApiProperty({ required: false, description: 'Informations supplémentaires' })
  metadata?: any;
}
