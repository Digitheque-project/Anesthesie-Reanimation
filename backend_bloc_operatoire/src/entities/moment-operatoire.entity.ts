import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum CategorieMoment {
  ANESTHESIE = 'ANESTHESIE',
  CHIRURGIE = 'CHIRURGIE',
  DIVERS = 'DIVERS',
}

// Horodatage d'un moment opératoire (incision, fermeture, etc.), capturé au tap par
// l'anesthésiste/chirurgien/IBODE pendant l'opération et diffusé en temps réel à tous les
// postes connectés sur ce patient (voir OperationGateway). Suppression douce (`annule`) plutôt
// que DELETE réel, pour préserver la traçabilité clinique/médico-légale de la chronologie.
@Entity('moments_operatoires')
export class MomentOperatoire {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index() @Column() patientId: string;

  @Column() label: string;
  @Column({ type: 'enum', enum: CategorieMoment }) categorie: CategorieMoment;
  @Column({ default: false }) estPersonnalise: boolean;

  // Instant du tap, capturé côté client — source de vérité clinique (pas l'instant de
  // réception serveur, qui peut accuser un léger retard réseau).
  @Column({ type: 'timestamptz' }) horodatage: Date;

  @Column() auteurId: string;
  @Column() auteurNom: string;
  @Column() auteurRole: string;

  @Column({ default: false }) annule: boolean;
  @Column({ type: 'timestamptz', nullable: true }) annuleLe: Date | null;
  @Column({ type: 'varchar', nullable: true }) annuleParNom: string | null;

  // Instant de réception serveur — sert à détecter la latence réseau, distinct de `horodatage`.
  @CreateDateColumn() enregistreLe: Date;
}
