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

  // Nullable : l'activité per-op est créée dès le début de l'opération (pour permettre le
  // rattachement des constantes en temps réel) — le chirurgien/anesthésiste peuvent être
  // renseignés plus tard via PATCH, pas nécessairement connus à la création.
  @ManyToOne(() => Medecin, { eager: true, nullable: true })
  chirurgien: Medecin | null;

  @Column({ nullable: true })
  chirurgienId: string | null;

  @ManyToOne(() => Medecin, { eager: true, nullable: true })
  anesthesiste: Medecin | null;

  @Column({ nullable: true })
  anesthesisteId: string | null;

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
