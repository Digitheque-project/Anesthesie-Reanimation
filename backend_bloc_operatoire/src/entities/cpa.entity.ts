import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
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

// Devenir de l'opération une fois la décision d'aptitude prise (distinct de DecisionCPA.REPORT,
// qui concerne la CPA elle-même à refaire — pas l'opération) :
//   - Apte    -> RETENUE (date confirmée) ou REPORTEE (opération à reporter)
//   - Inapte  -> REPORTEE ou REFUSEE (opération impossible)
export enum DecisionOperation {
  RETENUE = 'RETENUE',
  REPORTEE = 'REPORTEE',
  REFUSEE = 'REFUSEE',
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

  // Référence l'identité de l'anesthésiste — soit un userId du service central SSO (médecin
  // interne, cas normal), soit un id de la table locale `medecins` (médecin externe, ou
  // donnée historique). Plus de FK/relation TypeORM : voir CentralUserClient pour
  // l'enrichissement en lecture.
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

  @Column({ type: 'enum', enum: DecisionOperation, nullable: true })
  decisionOperation: DecisionOperation | null;

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
  medicamentsAnesthesieReanimation: {
    categorie: string;
    nom: string;
    dosage?: string;
    observation?: string;
  }[];

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
