import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { CPA } from './cpa.entity';
import { Medecin } from './medecin.entity';

export enum StatutVPA {
  EN_ATTENTE = 'EN_ATTENTE',
  VALIDE = 'VALIDE',
}

@Entity('vpa')
export class VPA {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ nullable: true })
  patientId: string;

  @ManyToOne(() => CPA, { eager: true, nullable: true })
  cpa: CPA;

  @Column({ nullable: true })
  cpaId: string;

  @ManyToOne(() => Medecin, { eager: true, nullable: true })
  anesthesiste: Medecin;

  @Column({ nullable: true })
  anesthesisteId: string;

  @Column({ type: 'date' })
  dateVisite: Date;

  @Column({ default: false })
  identiteConfirmee: boolean;

  @Column({ default: false })
  jeuneRespected: boolean;

  @Column({ default: false })
  instructionsRespectees: boolean;

  @Column({ default: false })
  premedicationFaite: boolean;

  @Column('text')
  jeune: string;

  @Column('text')
  examensComplementaires: string;

  @Column('simple-json', { nullable: true })
  commandeSang: any;

  @Column({ length: 20 })
  heureDepart: string;

  @Column({ type: 'enum', enum: StatutVPA, default: StatutVPA.EN_ATTENTE })
  statut: StatutVPA;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
