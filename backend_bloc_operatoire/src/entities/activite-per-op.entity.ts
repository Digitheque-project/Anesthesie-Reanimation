import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Medecin } from './medecin.entity';
import { ConstantePerOp } from './constante-per-op.entity';

@Entity('activites_per_op')
export class ActivitePerOp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  patientId: string;

  @ManyToOne(() => Medecin, { eager: true })
  chirurgien: Medecin;

  @Column()
  chirurgienId: string;

  @ManyToOne(() => Medecin, { eager: true })
  anesthesiste: Medecin;

  @Column()
  anesthesisteId: string;

  @Column({ type: 'date' })
  dateOperation: Date;

  // Apports
  @Column('text', { nullable: true })
  perfusions: string;

  @Column('text', { nullable: true })
  transfusions: string;

  // Sorties
  @Column('text', { nullable: true })
  journalSorties: string;

  // ✅ Plusieurs constantes (surveillances)
  @OneToMany(() => ConstantePerOp, (c) => c.activitePerOp, { cascade: true })
  constantes: ConstantePerOp[];

  // Ventilation & intubation
  @Column({ default: false })
  intubationOT: boolean;

  @Column({ default: false })
  sArme: boolean;

  @Column({ default: false })
  masqueLarynge: boolean;

  @Column('simple-json', { nullable: true })
  ventilation: {
    spontanee: string;
    assistee: string;
    controlee: string;
    peep: string;
    circuitFerme: string;
  };

  // État à l’arrivée (plusieurs valeurs possibles)
  @Column('simple-array', { nullable: true })
  etatArrivee: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
