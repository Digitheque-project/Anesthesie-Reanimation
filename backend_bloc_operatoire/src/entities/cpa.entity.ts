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
  // l'enrichissement en lecture. Nullable : quand le Responsable CPA/Major réalise la CPA,
  // désigner l'anesthésiste n'est pas obligatoire (aucune fiche locale n'existe forcément).
  @Column({ type: 'varchar', nullable: true })
  anesthesisteId: string | null;

  // Distinct d'anesthesisteId : celui-ci reste toujours le clinicien ayant réalisé l'examen,
  // saisiParId/saisiParRole capturent qui a effectivement rempli/soumis ce dossier (utile quand
  // un Responsable CPA ou un Major saisit la CPA au nom de l'anesthésiste) — sert notamment à
  // mesurer l'activité propre du Responsable CPA dans les rapports, qui n'a sinon aucune trace
  // d'activité clinique qui lui soit propre. userId central SSO, jamais vide en pratique (le
  // guard exige toujours un utilisateur authentifié pour créer une CPA).
  @Column({ type: 'varchar', nullable: true })
  saisiParId: string | null;

  @Column({ type: 'varchar', nullable: true })
  saisiParRole: string | null;

  @Column({ type: 'date' })
  dateConsultation: Date;

  // Antécédents — champs ajoutés lors de la relecture de la fiche papier « Fiche d'Anesthésie –
  // Réanimation », section 1. Tous nullable/optionnels : seule la décision finale reste
  // bloquante à la validation, comme pour le reste de l'examen clinique.
  @Column({ type: 'text', nullable: true })
  histoireActuelle: string | null;

  // "Urgence (Dernier repas à / Dernière boisson)" — distinct de `jeune` (consignes de jeûne
  // données pour l'opération à venir) : ici, c'est un constat rétrospectif utile en urgence pour
  // évaluer le risque d'inhalation, pas une instruction prospective.
  @Column({ type: 'text', nullable: true })
  dernierRepasBoisson: string | null;

  @Column({ default: false })
  patientMineur: boolean;

  @Column({ default: false })
  autorisationOpererSignee: boolean;

  @Column({ default: false })
  antecedentsAnesthesie: boolean;

  @Column({ type: 'text', nullable: true })
  atcdMedicaux: string | null;

  @Column({ type: 'text', nullable: true })
  atcdChirurgicaux: string | null;

  // "Incidents" de la fiche papier — notesIncidents existait déjà avant cette relecture, on le
  // garde tel quel (même nom de champ, déjà utilisé par des CPA existantes).
  @Column({ type: 'text', nullable: true })
  notesIncidents: string;

  @Column({ default: false })
  asthme: boolean;

  @Column({ type: 'varchar', nullable: true })
  tempsSaignement: 'NORMAL' | 'ALLONGE' | null;

  // ATCD Obstétricaux : G(este)/P(are)/A(vortement)/DDR (date des dernières règles).
  @Column({ type: 'simple-json', nullable: true })
  atcdObstetricaux: { g?: string; p?: string; a?: string; ddr?: string } | null;

  @Column({ type: 'text', nullable: true })
  allergiesMedicamenteuses: string | null;

  @Column({ type: 'text', nullable: true })
  allergiesAutres: string | null;

  @Column({ type: 'text', nullable: true })
  contraception: string | null;

  // Groupage propre à la CPA (phénotype/RAI) — distinct de PatientBloc.groupeSanguin, qui ne
  // porte que le groupe ABO/Rhésus simple transmis par Accueil.
  @Column({ type: 'simple-json', nullable: true })
  groupeSanguinCpa: { groupe?: string; phenotype?: string; rai?: string } | null;

  @Column({ type: 'text', nullable: true })
  atcdFamiliaux: string | null;

  @Column({ default: false })
  transfusionsAnterieures: boolean;

  @Column({ type: 'text', nullable: true })
  transfusionsIncidents: string | null;

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

  // Bilan biologique / paraclinique — valeurs saisies librement (texte), pas de contrôle de
  // plage : ce sont des résultats d'examens externes recopiés, pas des mesures prises ici.
  // Numération : GB, GR, Hb, Ht, PL, TP, PQ, TCA, Fibri. Ionogramme : Na, K, Cl, RA, Gly, Prot,
  // Urée, Créat, Ac Ur.
  @Column({ type: 'simple-json', nullable: true })
  bilanBiologique: Record<string, string> | null;

  @Column({ type: 'text', nullable: true })
  ecg: string | null;

  @Column({ type: 'text', nullable: true })
  radioPulmonaire: string | null;

  @Column({ type: 'text', nullable: true })
  echographie: string | null;

  @Column({ type: 'text', nullable: true })
  scanner: string | null;

  @Column({ type: 'text', nullable: true })
  autresExamensParacliniques: string | null;

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

  // Conclusion — section 4 de la fiche papier.
  @Column({ type: 'text', nullable: true })
  traitementEnCours: string | null;

  @Column({ type: 'text', nullable: true })
  traitementASuivre: string | null;

  @Column({ type: 'text', nullable: true })
  conclusion: string | null;

  // Distinct de typeAnesthesie/techniqueIntubation (protocole retenu, ci-dessous) : ici, texte
  // libre pour toute recommandation complémentaire (ex. surveillance renforcée, précautions
  // particulières) qui ne rentre pas dans les champs structurés.
  @Column({ type: 'text', nullable: true })
  recommandationsProtocole: string | null;

  // Catégorie de haut niveau : 'Anesthésie Générale (AG)' | 'ALR' | 'AL'.
  @Column()
  typeAnesthesie: string;

  // Technique précise au sein de la catégorie ci-dessus — AG : Sédation/Intubation/Masque
  // Laryngé/Masque Facial ; ALR : Rachianesthésie/APD/Blocage ; sans objet pour AL (texte libre
  // combiné plutôt qu'un enum strict, la liste des techniques pouvant évoluer).
  @Column({ type: 'varchar', nullable: true })
  sousTypeAnesthesie: string | null;

  @Column()
  techniqueIntubation: string;

  // Premedicaments (relation)
  @OneToMany(() => Premedicament, (premed) => premed.cpa, { cascade: true })
  premedicaments: Premedicament[];

  // Médicaments/matériel à prévoir pendant l'anesthésie et la réanimation (distinct de la
  // prémédication, donnée avant le passage au bloc) — consultable dès la CPA. Sélection dans le
  // catalogue des 5 catégories (Sérum, Produits anesthésiques, Antalgiques, Antibiotiques &
  // autres, Consommables) ; seuls les articles cochés sont persistés, pas le catalogue entier.
  // `mode` indique si `dosage` contient une description de dosage ou une quantité ; `nombre` est
  // le nombre d'unités à prévoir, utilisé pour le rapprochement de prix avec le service Pharmacie.
  @Column({ type: 'simple-json', nullable: true })
  medicamentsAnesthesieReanimation: {
    categorie: string;
    nom: string;
    mode?: 'DOSAGE' | 'QUANTITE';
    dosage?: string;
    nombre?: number;
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
