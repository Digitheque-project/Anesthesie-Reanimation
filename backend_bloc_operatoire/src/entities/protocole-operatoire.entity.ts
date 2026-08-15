import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Drainage } from './drainage.entity';

@Entity('protocoles_operatoires')
export class ProtocoleOperatoire {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  patientId: string;

  @Column({ type: 'date' })
  dateOperation: Date;

  // Les intervenants (chirurgien, anesthésiste, infirmière, aide opératoire) référencent une
  // identité — userId central (interne) ou id local `medecins` (externe/historique) — pas
  // toujours renseignée, le formulaire ne proposant d'ailleurs aucun sélecteur pour ces champs,
  // donc nullable. Plus de FK/relation TypeORM, voir CentralUserClient.
  @Column({ type: 'varchar', nullable: true })
  chirurgienId: string | null;

  @Column({ type: 'varchar', nullable: true })
  anesthesisteId: string | null;

  @Column({ type: 'varchar', nullable: true })
  infirmiereId: string | null;

  @Column({ type: 'varchar', nullable: true })
  aideOperatoireId: string | null;

  // Compte-rendu du chirurgien — distinct de compteRenduAnesthesique (rédigé par l'anesthésiste,
  // équivalent anesthésique de ce compte-rendu). Nullable : l'anesthésiste peut créer cet
  // enregistrement en premier (juste après la check-list après intervention) sans attendre que
  // le chirurgien ait déjà saisi le sien.
  @Column('text', { nullable: true })
  compteRenduIntervention: string | null;

  // Compte-rendu de l'anesthésiste ("Protocole Anesthésique") — technique réalisée, produits/
  // doses administrés, incidents per-opératoires. Symétrique de compteRenduIntervention.
  @Column('text', { nullable: true })
  compteRenduAnesthesique: string | null;

  // Personnel ayant participé à l'intervention (chirurgien, aide, IBODE, IDE...), saisi en texte
  // libre par l'anesthésiste — distinct des champs d'ID structurés ci-dessus (jamais renseignés
  // par aucun formulaire), symétrique de compteRenduAnesthesique.
  @Column('text', { nullable: true })
  personnelIntervention: string | null;

  // Instructions post-opératoires — communes au chirurgien et à l'anesthésiste (les deux rôles
  // peuvent lire/compléter le même enregistrement, voir ProtocoleOperatoireController).
  @Column('simple-json')
  surveillance: {
    ta: { coche: boolean; valeur: string };
    pouls: { coche: boolean; valeur: string };
    fr: { coche: boolean; valeur: string };
    temperature: { coche: boolean; valeur: string };
    diurese: { coche: boolean; valeur: string };
    autres: { coche: boolean; valeur: string };
  };

  // Drainages (relation) — également partie des Instructions post-opératoires communes.
  @OneToMany(() => Drainage, (d) => d.protocole, { cascade: true })
  drainages: Drainage[];

  // Prescriptions post-opératoires
  @Column('simple-json')
  prescriptions: {
    perfusionBrasGauche: { valeur: string; enY: string };
    perfusionBrasDroit: { valeur: string; enY: string };
    voieCentrale: { valeur: string; enY: string };
    antibiotiques: string;
    antalgiques: string;
    autres: string;
  };

  @Column({ default: false })
  prescriptionsConjointes: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
