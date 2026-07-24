import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { CPA } from './cpa.entity';

// Contrôle final réalisé la veille de l'intervention, pour un patient ayant déjà eu une CPA
// (programmée à l'avance). À ne pas confondre avec le sigle "VPA" utilisé ailleurs dans
// l'application pour désigner la consultation urgente d'un patient sans CPA préalable, qui
// réutilise l'interface de la CPA elle-même.
export enum StatutVerificationVeille {
  EN_ATTENTE = 'EN_ATTENTE',
  VALIDE = 'VALIDE',
}

@Entity('verifications_veille')
export class VerificationVeille {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ nullable: true })
  patientId: string;

  @ManyToOne(() => CPA, { eager: true, nullable: true })
  cpa: CPA;

  @Column({ nullable: true })
  cpaId: string;

  // Référence l'identité de l'anesthésiste — userId central (interne) ou id local `medecins`
  // (externe/historique). Plus de FK/relation TypeORM, voir CentralUserClient.
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

  // Noms des médicaments d'anesthésie/réanimation (cochés pendant la CPA, cf.
  // CPA.medicamentsAnesthesieReanimation) reconfirmés par l'anesthésiste à la veille de
  // l'opération — traçabilité de la re-vérification, pas juste un affichage écran.
  @Column('simple-json', { nullable: true })
  medicamentsVerifies: string[] | null;

  @Column({ length: 20 })
  heureDepart: string;

  @Column({
    type: 'enum',
    enum: StatutVerificationVeille,
    default: StatutVerificationVeille.EN_ATTENTE,
  })
  statut: StatutVerificationVeille;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
