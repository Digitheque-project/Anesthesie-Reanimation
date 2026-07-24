import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum StatutChecklist {
  EN_COURS = 'EN_COURS',
  VALIDE = 'VALIDE',
}

@Entity('checklists_pendant_op')
export class ChecklistPendantOp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index() @Column() patientId: string;

  @Column({ type: 'date' }) dateCreation: Date;
  @Column({ default: false }) identiteUltimeConfirmee: boolean;
  @Column({ default: false }) interventionConfirmee: boolean;
  @Column({ default: false }) siteOperatoireConfirme: boolean;
  @Column({ default: false }) installationCorrecte: boolean;
  @Column({ default: false }) documentsDisponibles: boolean;
  @Column({ default: false }) antibioprophylaxieFaite: boolean;
  @Column({ default: false }) constantesStables: boolean;
  @Column({ default: false }) ventilationOK: boolean;
  @Column({
    type: 'enum',
    enum: StatutChecklist,
    default: StatutChecklist.EN_COURS,
  })
  statut: StatutChecklist;
  // Anesthésiste ayant validé la check-list — pour la traçabilité du personnel responsable
  // (visible notamment dans le dossier archivé du patient).
  @Column({ type: 'varchar', nullable: true }) validateurId: string | null;
  @Column({ type: 'varchar', nullable: true }) validateurNom: string | null;
  @Column({ type: 'varchar', nullable: true }) validateurRole: string | null;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
