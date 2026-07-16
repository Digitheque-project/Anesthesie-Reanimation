import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { Medecin } from './medecin.entity';

export enum StatutCreneau {
  PLANIFIE = 'PLANIFIE',
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE',
  ANNULE = 'ANNULE',
}

export enum TypeRDV {
  CPA = 'CPA',
  VPA = 'VPA',
}

@Entity('creneaux_bloc')
export class CreneauBloc {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time' })
  heureDebut: string;

  @Column({ type: 'time' })
  heureFin: string;

  @Column({ length: 50 })
  salle: string;

  @Index()
  @Column()
  patientId: string;

  @ManyToOne(() => Medecin, { eager: true, nullable: true })
  chirurgien: Medecin | null;

  @Column({ nullable: true })
  chirurgienId: string | null;

  // Nom libre du responsable saisi au moment de la planification (ex: professeur CPA), quand aucun Medecin n'est sélectionné.
  @Column({ type: 'varchar', length: 100, nullable: true })
  responsable: string | null;

  @Column({ type: 'enum', enum: StatutCreneau, default: StatutCreneau.PLANIFIE })
  statut: StatutCreneau;

  @Column({ default: false })
  estUrgence: boolean;

  @Column({ type: 'enum', enum: TypeRDV, default: TypeRDV.CPA })
  type: TypeRDV;

  @CreateDateColumn()
  createdAt: Date;
}
