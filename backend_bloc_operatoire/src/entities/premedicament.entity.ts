import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { CPA } from './cpa.entity';

@Entity('premedicaments')
export class Premedicament {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nom: string;

  @Column()
  dose: string;

  @Column()
  voieAdministration: string;

  @Column()
  debut: string;

  @Column()
  frequence: string;

  @ManyToOne(() => CPA, (cpa) => cpa.premedicaments, { onDelete: 'CASCADE' })
  cpa: CPA;
}
