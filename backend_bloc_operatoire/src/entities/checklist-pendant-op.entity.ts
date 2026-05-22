import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Patient } from './patient.entity';

export enum StatutChecklist {
  EN_COURS = 'EN_COURS',
  VALIDE = 'VALIDE',
}

@Entity('checklists_pendant_op')
export class ChecklistPendantOp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, { eager: true })
  patient: Patient;
  @Column() patientId: string;

  @Column({ type: 'date' }) dateCreation: Date;
  @Column({ default: false }) identiteUltimeConfirmee: boolean;
  @Column({ default: false }) interventionConfirmee: boolean;
  @Column({ default: false }) siteOperatoireConfirme: boolean;
  @Column({ default: false }) installationCorrecte: boolean;
  @Column({ default: false }) documentsDisponibles: boolean;
  @Column({ default: false }) antibioprophylaxieFaite: boolean;
  @Column({ default: false }) constantesStables: boolean;
  @Column({ default: false }) ventilationOK: boolean;
  @Column({ type: 'enum', enum: StatutChecklist, default: StatutChecklist.EN_COURS }) statut: StatutChecklist;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
