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

  @ManyToOne(() => Medecin, { eager: true })
  chirurgien: Medecin;

  @Column()
  chirurgienId: string;

  @ManyToOne(() => Medecin, { eager: true })
  anesthesiste: Medecin;

  @Column()
  anesthesisteId: string;

  @ManyToOne(() => Medecin, { eager: true })
  infirmiere: Medecin;

  @Column()
  infirmiereId: string;

  @ManyToOne(() => Medecin, { eager: true })
  aideOperatoire: Medecin;

  @Column()
  aideOperatoireId: string;

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
