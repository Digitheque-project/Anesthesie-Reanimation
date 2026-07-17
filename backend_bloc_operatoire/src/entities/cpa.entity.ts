import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { Medecin } from './medecin.entity';
import { Premedicament } from './premedicament.entity';

export enum ScoreASA {
  ASA_1 = 1,
  ASA_2 = 2,
  ASA_3 = 3,
  ASA_4 = 4,
  ASA_5 = 5,
  ASA_6 = 6,
  E = 'E',
}

export enum DecisionCPA {
  APTE = 'APTE',
  INAPTE = 'INAPTE',
  REPORT = 'REPORT',
}

export enum StatutCPA {
  EN_ATTENTE = 'EN_ATTENTE',
  REALISE = 'REALISE',
}

@Entity('cpa')
export class CPA {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  patientId: string;

  @ManyToOne(() => Medecin, { eager: true })
  anesthesiste: Medecin;

  @Column()
  anesthesisteId: string;

  @Column({ type: 'date' })
  dateConsultation: Date;

  // Antécédents
  @Column({ default: false })
  antecedentsAnesthesie: boolean;

  @Column({ type: 'text', nullable: true })
  notesIncidents: string;

  // Examen clinique
  @Column('int')
  frequenceCardiaque: number;

  @Column('simple-json')
  tensionArterielle: { systolique: number; diastolique: number };

  @Column('float')
  taille: number;

  @Column('float')
  poids: number;

  @Column('text')
  examenCardiovasculaire: string;

  @Column('text')
  examenPulmonaire: string;

  @Column('text')
  examenNeurologique: string;

  @Column('text')
  colorationConjonctivale: string;

  @Column('text')
  abordVeineux: string;

  @Column('text')
  rachis: string;

  // Voies aériennes
  @Column('int')
  mallampati: number; // 1-4

  @Column('float')
  ouvertureBuccale: number; // cm

  @Column('float')
  distanceMentoThyroidienne: number;

  @Column('text')
  dents: string;

  @Column('text')
  tabac: string;

  @Column('text')
  alcool: string;

  // Score & Décision
  @Column({ type: 'enum', enum: ScoreASA })
  scoreASA: ScoreASA;

  @Column({ type: 'enum', enum: DecisionCPA })
  decision: DecisionCPA;

  @Column({ type: 'text', nullable: true })
  motifRefus: string;

  @Column()
  typeAnesthesie: string;

  @Column()
  techniqueIntubation: string;

  // Premedicaments (relation)
  @OneToMany(() => Premedicament, (premed) => premed.cpa, { cascade: true })
  premedicaments: Premedicament[];

  // Médicaments à prévoir pendant l'anesthésie et la réanimation (distinct de la
  // prémédication, donnée avant le passage au bloc) — consultable dès la CPA.
  @Column({ type: 'simple-json', nullable: true })
  medicamentsAnesthesieReanimation: { nom: string; dose: string; voieAdministration?: string }[];

  @Column()
  jeune: string;

  @Column('text')
  preparationPhysique: string;

  @Column('text')
  tachesInfirmieres: string;

  @Column({ type: 'date', nullable: true })
  dateVPA: Date;

  @Column({ type: 'enum', enum: StatutCPA, default: StatutCPA.EN_ATTENTE })
  statut: StatutCPA;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
