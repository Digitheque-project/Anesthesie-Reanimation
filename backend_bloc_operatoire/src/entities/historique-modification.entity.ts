import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('historique_modifications')
export class HistoriqueModification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  entite: string; // ex: 'Patient', 'CPA'

  @Column()
  entiteId: string;

  @Column()
  action: string; // 'CREATE', 'UPDATE', 'DELETE', 'STATUT_CHANGE'

  @Column({ type: 'text', nullable: true })
  details: string; // JSON avec anciennes/nouvelles valeurs

  @Column({ nullable: true })
  utilisateurId: string;

  @CreateDateColumn()
  createdAt: Date;
}
