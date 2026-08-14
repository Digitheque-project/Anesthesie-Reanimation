import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PatientStatut {
  EN_ATTENTE_CPA = 'EN_ATTENTE_CPA',
  CPA_REALISE = 'CPA_REALISE',
  CPA_INAPTE = 'CPA_INAPTE',
  EN_ATTENTE_VERIFICATION_VEILLE = 'EN_ATTENTE_VERIFICATION_VEILLE',
  VERIFICATION_VEILLE_REALISEE = 'VERIFICATION_VEILLE_REALISEE',
  PRET_POUR_BLOC = 'PRET_POUR_BLOC',
  EN_COURS_OPERATION = 'EN_COURS_OPERATION',
  EN_SALLE_REVEIL = 'EN_SALLE_REVEIL',
  SORTI = 'SORTI',
}

export enum NiveauUrgence {
  TRES_URGENT = 'TRES_URGENT',
  URGENT = 'URGENT',
  NORMAL = 'NORMAL',
}

// Fiche de suivi opératoire locale au Bloc Opératoire.
// L'identité du patient (nom, prénom, etc.) vit dans le service externe Accueil ;
// cette table ne garde que les données propres au workflow du bloc.
@Entity('patients_bloc')
export class PatientBloc {
  @PrimaryColumn({ length: 50 })
  patientId: string;

  @Column({ length: 50 })
  chuId: string;

  @Column({ length: 50, unique: true })
  idDossier: string;

  @Column({ length: 20 })
  groupeSanguin: string;

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

  // ── Détail de la prescription chirurgicale transmise par le service prescripteur ──────────
  // Ces champs arrivent avec la prescription (ou la demande de CPA externe) et n'existaient
  // nulle part en base : la section « Prescription chirurgicale » du dossier patient ne pouvait
  // donc afficher que l'acte, le type de chirurgie, la date et le risque hémorragique, alors que
  // le prescripteur les renseigne. Ils conditionnent pourtant la préparation du bloc (position,
  // matériel, durée à réserver) et l'évaluation pré-anesthésique (renseignement clinique, type
  // d'anesthésie envisagé, risque infectieux).

  // Contexte clinique motivant l'intervention, rédigé par le prescripteur.
  @Column({ type: 'text', nullable: true })
  renseignementClinique: string | null;

  // Anesthésie envisagée par le prescripteur (générale, locorégionale, sédation...) — reste une
  // proposition : la décision appartient à l'anesthésiste lors de la CPA.
  @Column({ type: 'varchar', length: 100, nullable: true })
  typeAnesthesie: string | null;

  // Durée prévue de l'intervention, en minutes — sert à réserver le créneau de salle.
  @Column({ type: 'int', nullable: true })
  dureeInterventionMinutes: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  risqueInfectieux: string | null;

  // Matériel/implants à prévoir (ancillaire, prothèse, cœlioscopie, amplificateur...).
  @Column({ type: 'text', nullable: true })
  materielNecessaire: string | null;

  // Installation du patient sur la table (décubitus dorsal, ventral, gynécologique...).
  @Column({ type: 'varchar', length: 150, nullable: true })
  positionPatient: string | null;

  @Column({ type: 'text', nullable: true })
  alertes: string;

  @Column({ length: 36, nullable: true })
  prescripteurId: string;

  @Column({ length: 100, nullable: true })
  chirurgien_nom: string;

  @Column({
    type: 'enum',
    enum: PatientStatut,
    default: PatientStatut.EN_ATTENTE_CPA,
  })
  statut: PatientStatut;

  @Column({ type: 'enum', enum: NiveauUrgence, default: NiveauUrgence.NORMAL })
  niveauUrgence: NiveauUrgence;

  @Column({ length: 20, nullable: true })
  chambre: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  serviceOrigine: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  serviceOrigineId: string | null;

  @Column({ type: 'text', nullable: true })
  motifRefusCpa: string | null;

  // ID de la prescription sur le service central "Prescriptions" (déduplication de l'ingestion)
  @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
  prescriptionExterneId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
