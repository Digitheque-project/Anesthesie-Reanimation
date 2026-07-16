import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum StatutChecklist {
  EN_COURS = 'EN_COURS',
  VALIDE = 'VALIDE',
}

@Entity('checklists_avant_op')
export class ChecklistAvantOp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index() @Column() patientId: string;

  @Column({ type: 'date' }) dateCreation: Date;
  @Column({ default: false }) identiteConfirmee: boolean;
  @Column({ default: false }) interventionSiteConfirmes: boolean;
  @Column({ default: false }) documentationDisponible: boolean;
  @Column({ default: false }) installationConnue: boolean;
  @Column({ default: false }) materielChirurgicalVerifie: boolean;
  @Column({ default: false }) materielAnesthesiqueVerifie: boolean;
  @Column({ default: false }) allergiePatient: boolean;
  @Column({ default: false }) risqueIntubation: boolean;
  @Column({ default: false }) risqueSaignement: boolean;
  // Phase 2 (Time Out) : vérification croisée "ultime", indépendante de la phase 1 (Sign In)
  @Column({ default: false }) identiteConfirmeeUltime: boolean;
  @Column({ default: false }) interventionConfirmeeUltime: boolean;
  @Column({ default: false }) antibioprophylaxieFaite: boolean;
  @Column({ type: 'text', nullable: true }) notesChirurgicales: string;
  @Column({ type: 'text', nullable: true }) notesAnesthesiques: string;
  @Column({ type: 'text', nullable: true }) notesIdeIbode: string;
  @Column({ type: 'enum', enum: StatutChecklist, default: StatutChecklist.EN_COURS }) statut: StatutChecklist;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
