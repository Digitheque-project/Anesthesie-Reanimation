import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Medecin } from './medecin.entity';

export enum StatutNotificationCPA {
  EN_ATTENTE = 'EN_ATTENTE',
  RDV_PLANIFIE = 'RDV_PLANIFIE',
  REALISE = 'REALISE',
}

@Entity('notifications_cpa')
export class NotificationCPA {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  heurePrescription: string;

  @Index()
  @Column()
  patientId: string;

  @Column()
  intervention: string;

  @ManyToOne(() => Medecin, { eager: true, nullable: true })
  chirurgien: Medecin | null; // médecin qui opère, s'il est enregistré localement

  @Column({ type: 'varchar', nullable: true })
  chirurgienId: string | null;

  // Nom libre du chirurgien tel que transmis par le service prescripteur (quand non résolu vers un Medecin local)
  @Column({ type: 'varchar', length: 100, nullable: true })
  chirurgienNom: string | null;

  @Column({ type: 'varchar', nullable: true })
  professeurCPA: string | null; // professeur responsable de la CPA

  @Column({ default: false })
  estUrgent: boolean;

  @Column({ type: 'enum', enum: StatutNotificationCPA, default: StatutNotificationCPA.EN_ATTENTE })
  statut: StatutNotificationCPA;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
