import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum PatientStatut {
  EN_ATTENTE_CPA = 'EN_ATTENTE_CPA',
  CPA_REALISE = 'CPA_REALISE',
  EN_ATTENTE_VPA = 'EN_ATTENTE_VPA',
  VPA_REALISE = 'VPA_REALISE',
  PRET_POUR_BLOC = 'PRET_POUR_BLOC',
  EN_COURS_OPERATION = 'EN_COURS_OPERATION',
  EN_SALLE_REVEIL = 'EN_SALLE_REVEIL',
  SORTI = 'SORTI',
}

export enum NiveauUrgence {
  STAT = 'STAT',
  URGENT = 'URGENT',
  NORMAL = 'NORMAL',
}

export enum Sexe {
  M = 'M',
  F = 'F',
}

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nom: string;

  @Column({ length: 100 })
  prenom: string;

  @Column({ type: 'date' })
  dateNaissance: Date;

  @Column({ type: 'enum', enum: Sexe })
  sexe: Sexe;

  @Column({ length: 20 })
  telephone: string;

  @Column({ type: 'text' })
  adresse: string;

  @Column({ length: 50, unique: true })
  idDossier: string;

  @Column({ length: 20 })
  groupeSanguin: string;

  // NOUVEAUX CHAMPS
  @Column({ length: 255, nullable: true })
  libelle: string;

  @Column({ length: 50, nullable: true })
  risqueHemorragique: string;

  @Column({ length: 100, nullable: true })
  typeChirurgie: string;

  @Column({ type: 'text', nullable: true })
  consignes: string;

  @Column({ type: 'timestamp', nullable: true })
  dateIntervention: Date;

  @Column({ type: 'text', nullable: true })
  alertes: string;

  @Column({ length: 36, nullable: true })
  prescripteurId: string;

  @Column({ length: 100, nullable: true })
  chirurgien_nom: string;

  @Column({ type: 'enum', enum: PatientStatut, default: PatientStatut.EN_ATTENTE_CPA })
  statut: PatientStatut;

  @Column({ type: 'enum', enum: NiveauUrgence, default: NiveauUrgence.NORMAL })
  niveauUrgence: NiveauUrgence;

  @Column({ length: 20, nullable: true })
  chambre: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
