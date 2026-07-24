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
import { VerificationVeille } from './verification-veille.entity';
import { ItemCommande } from './item-commande.entity';

export enum StatutBonCommande {
  EN_ATTENTE = 'EN_ATTENTE',
  VALIDE = 'VALIDE',
}

@Entity('bons_commande')
export class BonCommandeAnesthesie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  patientId: string;

  @ManyToOne(() => VerificationVeille, { eager: true })
  verificationVeille: VerificationVeille;

  @Column()
  verificationVeilleId: string;

  // Référencent l'identité — userId central (interne) ou id local `medecins`
  // (externe/historique). Plus de FK/relation TypeORM, voir CentralUserClient.
  @Column()
  chirurgienId: string;

  @Column()
  anesthesisteId: string;

  @Column({ type: 'date' })
  dateCreation: Date;

  @OneToMany(() => ItemCommande, (item) => item.bonCommande, { cascade: true })
  items: ItemCommande[];

  @Column('simple-array')
  consommables: string[];

  @Column({
    type: 'enum',
    enum: StatutBonCommande,
    default: StatutBonCommande.EN_ATTENTE,
  })
  statut: StatutBonCommande;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
