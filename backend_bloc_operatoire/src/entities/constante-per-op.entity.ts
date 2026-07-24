import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ActivitePerOp } from './activite-per-op.entity';

@Entity('constantes_per_op')
export class ConstantePerOp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Texte libre historique, conservé pour l'affichage des anciennes lignes.
  @Column()
  heure: string;

  // Horodatage réel (capturé côté client), utilisé par les nouvelles saisies en temps réel —
  // remplace progressivement `heure`.
  @Column({ type: 'timestamptz', nullable: true })
  horodatage: Date | null;

  @Column('int')
  fc: number; // Fréquence cardiaque

  @Column()
  ta: string; // Tension artérielle

  @Column('float')
  spo2: number;

  @Column('float')
  temperature: number;

  @Column('float')
  capnie: number;

  @Column('int')
  score: number;

  @ManyToOne(() => ActivitePerOp, (activite) => activite.constantes, {
    onDelete: 'CASCADE',
  })
  activitePerOp: ActivitePerOp;
}
