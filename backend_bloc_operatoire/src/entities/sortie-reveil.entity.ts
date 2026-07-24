import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ScoreSCCRE } from './score-sccre.entity';

export enum StatutSortieReveil {
  EN_ATTENTE = 'EN_ATTENTE',
  VALIDE = 'VALIDE',
}

@Entity('sorties_reveil')
export class SortieReveil {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  patientId: string;

  @ManyToOne(() => ScoreSCCRE, { eager: true })
  scoreSCCRE: ScoreSCCRE;

  @Column()
  scoreSCCREId: string;

  // Référence l'identité du médecin qui autorise la sortie — userId central (interne) ou id
  // local `medecins` (externe/historique). Plus de FK/relation TypeORM, voir CentralUserClient.
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

  @Column({
    type: 'enum',
    enum: StatutSortieReveil,
    default: StatutSortieReveil.EN_ATTENTE,
  })
  statut: StatutSortieReveil;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
