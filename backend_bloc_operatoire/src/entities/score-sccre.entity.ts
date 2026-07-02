import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate, Index } from 'typeorm';
import { Medecin } from './medecin.entity';

export enum StatutScoreSCCRE {
  EN_COURS = 'EN_COURS',
  VALIDE = 'VALIDE',
}

@Entity('scores_sccre')
export class ScoreSCCRE {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index() @Column() patientId: string;

  @ManyToOne(() => Medecin, { eager: true })
  anesthesiste: Medecin;
  @Column() anesthesisteId: string;

  @Column() heureArrivee: string;
  @Column({ type: 'date' }) dateEvaluation: Date;

  @Column('int') motricite: number;
  @Column('int') respiration: number;
  @Column('int') pressionArterielle: number;
  @Column('int') etatConscience: number;
  @Column('int') coloration: number;
  @Column('int') scoreTotal: number;

  @BeforeInsert() @BeforeUpdate()
  calculerScoreTotal() {
    this.scoreTotal = +this.motricite + +this.respiration + +this.pressionArterielle + +this.etatConscience + +this.coloration;
  }

  @Column('int') evs: number;
  @Column('int') eqa: number;
  @Column('int') eva: number;

  @Column('simple-json') etatInitial: { intubation: boolean; curarisation: boolean };
  @Column('simple-json') reponse: { intubation: boolean; curarisation: boolean };

  @Column({ default: false }) sortieAutorisee: boolean;
  @Column({ type: 'enum', enum: StatutScoreSCCRE, default: StatutScoreSCCRE.EN_COURS }) statut: StatutScoreSCCRE;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
