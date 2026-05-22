import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
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

  @ManyToOne(() => Patient, { eager: true })
  patient: Patient;

  @Column()
  patientId: string;

  @Column()
  intervention: string;

  @ManyToOne(() => Medecin, { eager: true })
  chirurgien: Medecin; // médecin qui opère

  @Column()
  chirurgienId: string;

  @Column()
  professeurCPA: string; // professeur responsable de la CPA

  @Column({ default: false })
  estUrgent: boolean;

  @Column({ type: 'enum', enum: StatutNotificationCPA, default: StatutNotificationCPA.EN_ATTENTE })
  statut: StatutNotificationCPA;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
