import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { NiveauUrgence } from './patient-bloc.entity';

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

  // Date et heure prévues de l'opération telles que transmises par le service prescripteur —
  // distincte de heurePrescription (heure de réception de la prescription au bloc).
  @Column({ type: 'timestamp', nullable: true })
  dateIntervention: Date | null;

  @Index()
  @Column()
  patientId: string;

  @Column()
  intervention: string;

  // Référence l'identité du chirurgien qui opère — userId central (interne) ou id local
  // `medecins` (externe/historique). Plus de FK/relation TypeORM, voir CentralUserClient.
  @Column({ type: 'varchar', nullable: true })
  chirurgienId: string | null;

  // Nom libre du chirurgien tel que transmis par le service prescripteur (quand non résolu vers un Medecin local)
  @Column({ type: 'varchar', length: 100, nullable: true })
  chirurgienNom: string | null;

  @Column({ type: 'varchar', nullable: true })
  professeurCPA: string | null; // professeur responsable de la CPA

  // Service à l'origine de la prescription (ex. Chirurgie, Urgences) — id transmis par le
  // service Prescriptions, nom résolu via le registre central des services (voir
  // ServiceRegistryClient) car jamais transmis directement par la prescription elle-même.
  @Column({ type: 'varchar', nullable: true })
  serviceSourceId: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  serviceSourceNom: string | null;

  @Column({ default: false })
  estUrgent: boolean;

  // Niveau d'urgence précis (TRES_URGENT distinct d'URGENT) — `estUrgent` seul ne suffit pas à
  // l'affichage (badge orange vs rouge) : sans ce champ, TRES_URGENT s'affichait comme URGENT
  // partout où seul le booléen était disponible (voir niveauUrgenceNotification côté front).
  @Column({
    type: 'enum',
    enum: NiveauUrgence,
    nullable: true,
  })
  niveauUrgence: NiveauUrgence | null;

  @Column({
    type: 'enum',
    enum: StatutNotificationCPA,
    default: StatutNotificationCPA.EN_ATTENTE,
  })
  statut: StatutNotificationCPA;

  // Distinct de `statut` (qui suit l'avancement du traitement — planifié, réalisé...) : une
  // notification peut être vue/écartée sans que sa demande sous-jacente soit encore traitée.
  // Sans ce champ, "marquer comme lu" ne pouvait jamais persister — l'ancienne implémentation
  // n'existait qu'en mémoire locale du navigateur (perdue au rechargement, jamais filtrée nulle
  // part), et son unique appel API visait une route qui n'a jamais existé côté backend.
  @Column({ default: false })
  lu: boolean;

  @Column({ type: 'timestamp', nullable: true })
  luLe: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
