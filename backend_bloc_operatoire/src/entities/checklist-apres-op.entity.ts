import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum StatutChecklist {
  EN_COURS = 'EN_COURS',
  VALIDE = 'VALIDE',
}

@Entity('checklists_apres_op')
export class ChecklistApresOp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index() @Column() patientId: string;

  @Column({ type: 'date' }) dateCreation: Date;
  @Column({ default: false }) interventionEnregistree: boolean;
  @Column({ default: false }) compteFinalCorrect: boolean;
  @Column({ default: false }) etiquetageVerifie: boolean;
  @Column({ default: false }) signalementsEffectues: boolean;
  @Column({ default: false }) transfertSalleReveil: boolean;
  @Column({ type: 'text', nullable: true }) observationsParticulieres: string;
  @Column({ type: 'enum', enum: StatutChecklist, default: StatutChecklist.EN_COURS }) statut: StatutChecklist;
  // Anesthésiste ayant validé la check-list — pour la traçabilité du personnel responsable
  // (visible notamment dans le dossier archivé du patient).
  @Column({ type: 'varchar', nullable: true }) validateurId: string | null;
  @Column({ type: 'varchar', nullable: true }) validateurNom: string | null;
  @Column({ type: 'varchar', nullable: true }) validateurRole: string | null;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
