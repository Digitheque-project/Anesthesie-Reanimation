import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { Medecin } from './medecin.entity';
import { Premedicament } from './premedicament.entity';

export enum ScoreASA {
  ASA_1 = 1,
  ASA_2 = 2,
  ASA_3 = 3,
  ASA_4 = 4,
  ASA_5 = 5,
  ASA_6 = 6,
  E = 'E',
}

export enum DecisionCPA {
  APTE = 'APTE',
  INAPTE = 'INAPTE',
  REPORT = 'REPORT',
}

export enum StatutCPA {
  EN_ATTENTE = 'EN_ATTENTE',
  REALISE = 'REALISE',
}

@Entity('cpa')
export class CPA {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  patientId: string;

  @ManyToOne(() => Medecin, { eager: true })
  anesthesiste: Medecin;

  @Column()
  anesthesisteId: string;

  @Column({ type: 'date' })
  dateConsultation: Date;

  // Antécédents
  @Column({ default: false })
  antecedentsAnesthesie: boolean;

  @Column({ type: 'text', nullable: true })
  notesIncidents: string;

  // Examen clinique — mesures non bloquantes : seule la décision finale est obligatoire à la
  // validation de la CPA, l'anesthésiste peut valider sans avoir renseigné chaque constante.
  @Column('int', { nullable: true })
  frequenceCardiaque: number | null;

  @Column('simple-json', { nullable: true })
  tensionArterielle: { systolique: number; diastolique: number } | null;

  @Column('float', { nullable: true })
  taille: number | null;

  @Column('float', { nullable: true })
  poids: number | null;

  @Column('text')
  examenCardiovasculaire: string;

  @Column('text')
  examenPulmonaire: string;

  @Column('text')
  examenNeurologique: string;

  @Column('text')
  colorationConjonctivale: string;

  @Column('text')
  abordVeineux: string;

  @Column('text')
  rachis: string;

  // Voies aériennes
  @Column('int', { nullable: true })
  mallampati: number | null; // 1-4

  @Column('float', { nullable: true })
  ouvertureBuccale: number | null; // cm

  @Column('float', { nullable: true })
  distanceMentoThyroidienne: number | null;

  @Column('text')
  dents: string;

  @Column('text')
  tabac: string;

  @Column('text')
  alcool: string;

  // Score & Décision
  @Column({ type: 'enum', enum: ScoreASA })
  scoreASA: ScoreASA;

  @Column({ type: 'enum', enum: DecisionCPA })
  decision: DecisionCPA;

  @Column({ type: 'text', nullable: true })
  motifRefus: string;

  // Mention informelle (pas un vrai workflow d'approbation) : certaines CPA sont validées par un
  // simple appel téléphonique au Prof/chef de service — ce champ ne fait que l'afficher, il ne
  // bloque ni ne conditionne rien.
  @Column({ type: 'text', nullable: true })
  validationProfInformelle: string;

  @Column()
  typeAnesthesie: string;

  @Column()
  techniqueIntubation: string;

  // Premedicaments (relation)
  @OneToMany(() => Premedicament, (premed) => premed.cpa, { cascade: true })
  premedicaments: Premedicament[];

  // Médicaments/matériel à prévoir pendant l'anesthésie et la réanimation (distinct de la
  // prémédication, donnée avant le passage au bloc) — consultable dès la CPA. Sélection dans le
  // catalogue des 7 catégories (Sérums, Produits anesthésiques, Antalgiques, Kit asepsie,
  // Antibiotiques & autres, Dispositifs médicaux, Consommables) ; seuls les articles cochés sont
  // persistés, pas le catalogue entier.
  @Column({ type: 'simple-json', nullable: true })
  medicamentsAnesthesieReanimation: { categorie: string; nom: string; dosage?: string; observation?: string }[];

  @Column()
  jeune: string;

  @Column('text')
  preparationPhysique: string;

  @Column('text')
  tachesInfirmieres: string;

  @Column({ type: 'date', nullable: true })
  dateVerificationVeille: Date;

  @Column({ type: 'enum', enum: StatutCPA, default: StatutCPA.EN_ATTENTE })
  statut: StatutCPA;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
