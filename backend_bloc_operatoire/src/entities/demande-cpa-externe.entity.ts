import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum StatutDemandeCpaExterne {
  EN_ATTENTE = 'EN_ATTENTE',
  CPA_PLANIFIEE = 'CPA_PLANIFIEE',
  CPA_REALISEE = 'CPA_REALISEE',
  VPA_PLANIFIEE = 'VPA_PLANIFIEE',
  VPA_REALISEE = 'VPA_REALISEE',
  CONFIRMEE = 'CONFIRMEE',
  REPORTEE = 'REPORTEE',
  ANNULEE = 'ANNULEE',
}

// Demande de CPA/VPA émise par un service externe (ex: Endoscopie) pour un patient
// devant subir un acte sous anesthésie générale. Distincte de NotificationCPA
// (demandes internes chirurgien -> équipe CPA au sein du Bloc).
@Entity('demandes_cpa_externes')
export class DemandeCpaExterne {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ length: 50 })
  patientId: string;

  @Column({ length: 50, nullable: true })
  chuId: string;

  @Column({ length: 100 })
  sourceServiceId: string;

  @Column({ length: 100, nullable: true })
  sourceServiceName: string;

  @Column({ length: 50 })
  sourceReferenceType: string;

  @Column({ length: 100 })
  sourceReferenceId: string;

  @Column({ length: 100 })
  typeAnesthesie: string;

  @Column({ type: 'text', nullable: true })
  motif: string;

  @Column({ type: 'int', nullable: true })
  urgence: number;

  @Column({ type: 'timestamp', nullable: true })
  dateExamenSouhaitee: Date;

  @Column({ type: 'enum', enum: StatutDemandeCpaExterne, default: StatutDemandeCpaExterne.EN_ATTENTE })
  statut: StatutDemandeCpaExterne;

  @Column({ type: 'timestamp', nullable: true })
  dateCpaPlanifiee: Date;

  @Column({ type: 'timestamp', nullable: true })
  dateVpaPlanifiee: Date;

  @Column({ length: 50, nullable: true })
  cpaId: string;

  @Column({ length: 50, nullable: true })
  vpaId: string;

  @Column({ type: 'jsonb', nullable: true })
  payload: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
