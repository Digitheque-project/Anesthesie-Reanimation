import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('webhook_notifications')
export class WebhookNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  motif: string;

  @Column({ nullable: true })
  patientId: string;

  @Column({ nullable: true })
  sourceServiceId: string;

  @Column({ nullable: true })
  sourceServiceName: string;

  @Column({ nullable: true })
  targetServiceId: string;

  @Column({ nullable: true })
  targetServiceName: string;

  @Column({ type: 'int', nullable: true })
  urgence: number;

  @Column({ type: 'jsonb', nullable: true })
  payload: any;

  @Column({ type: 'text', array: true, nullable: true })
  channels: string[];

  @Column({ default: false })
  processed: boolean;

  @CreateDateColumn({ name: 'receivedAt' })
  receivedAt: Date;
}
