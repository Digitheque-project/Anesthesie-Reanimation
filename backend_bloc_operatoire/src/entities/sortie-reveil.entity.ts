import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
import { ScoreSCCRE } from './score-sccre.entity';
import { Medecin } from './medecin.entity';

export enum StatutSortieReveil {
  EN_ATTENTE = 'EN_ATTENTE',
  VALIDE = 'VALIDE',
}

@Entity('sorties_reveil')
export class SortieReveil {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, { eager: true })
  patient: Patient;

  @Column()
  patientId: string;

  @ManyToOne(() => ScoreSCCRE, { eager: true })
  scoreSCCRE: ScoreSCCRE;

  @Column()
  scoreSCCREId: string;

  @ManyToOne(() => Medecin, { eager: true })
  medecin: Medecin; // médecin qui autorise la sortie

  @Column()
  medecinId: string;

  @Column({ type: 'timestamp' })
  dateHeureSortie: Date;

  @Column({ default: false })
  versServiceOrigine: boolean;

  @Column('simple-array', { nullable: true })
  autresServicesDestination: string[];

  // Checklist de sortie
  @Column('simple-json')
  checklistSortie: {
    signesVitauxStables: boolean;
    douleurControlee: boolean;
    prescriptionsFaites: boolean;
    familleInformee: boolean;
  };

  @Column({ type: 'enum', enum: StatutSortieReveil, default: StatutSortieReveil.EN_ATTENTE })
  statut: StatutSortieReveil;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
