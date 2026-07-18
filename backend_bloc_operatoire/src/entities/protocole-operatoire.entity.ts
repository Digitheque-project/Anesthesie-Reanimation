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

  // Les intervenants (chirurgien, anesthésiste, infirmière, aide opératoire) ne sont pas
  // toujours enregistrés comme Medecin local — le formulaire ne propose d'ailleurs aucun
  // sélecteur pour ces champs — donc nullable, comme NotificationCPA.chirurgienId.
  @ManyToOne(() => Medecin, { eager: true, nullable: true })
  chirurgien: Medecin | null;

  @Column({ type: 'varchar', nullable: true })
  chirurgienId: string | null;

  @ManyToOne(() => Medecin, { eager: true, nullable: true })
  anesthesiste: Medecin | null;

  @Column({ type: 'varchar', nullable: true })
  anesthesisteId: string | null;

  @ManyToOne(() => Medecin, { eager: true, nullable: true })
  infirmiere: Medecin | null;

  @Column({ type: 'varchar', nullable: true })
  infirmiereId: string | null;

  @ManyToOne(() => Medecin, { eager: true, nullable: true })
  aideOperatoire: Medecin | null;

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
