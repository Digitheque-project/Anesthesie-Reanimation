import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Drainage } from './drainage.entity';

@Entity('protocoles_operatoires')
export class ProtocoleOperatoire {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  patientId: string;

  @Column({ type: 'date' })
  dateOperation: Date;

  // Les intervenants (chirurgien, anesthésiste, infirmière, aide opératoire) référencent une
  // identité — userId central (interne) ou id local `medecins` (externe/historique) — pas
  // toujours renseignée, le formulaire ne proposant d'ailleurs aucun sélecteur pour ces champs,
  // donc nullable. Plus de FK/relation TypeORM, voir CentralUserClient.
  @Column({ type: 'varchar', nullable: true })
  chirurgienId: string | null;

  @Column({ type: 'varchar', nullable: true })
  anesthesisteId: string | null;

  @Column({ type: 'varchar', nullable: true })
  infirmiereId: string | null;

  @Column({ type: 'varchar', nullable: true })
  aideOperatoireId: string | null;

  @Column('text')
  compteRenduIntervention: string;

  // Surveillance post-opératoire
  @Column('simple-json')
  surveillance: {
    ta: string;
    pouls: string;
    fr: string;
    temperature: string;
    diurèse: string;
    autres: string;
  };

  // Drainages (relation)
  @OneToMany(() => Drainage, (d) => d.protocole, { cascade: true })
  drainages: Drainage[];

  // Prescriptions post-opératoires
  @Column('simple-json')
  prescriptions: {
    perfusionBrasGauche: boolean;
    perfusionBrasDroit: boolean;
    voieCentrale: boolean;
    antibiotiques: string;
    antalgiques: string;
    autres: string;
  };

  @Column({ default: false })
  prescriptionsConjointes: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
