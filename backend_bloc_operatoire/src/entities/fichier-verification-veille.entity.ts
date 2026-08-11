import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Pièce jointe importée sur l'écran « Vérification la veille » (PDF, image, document Office,
// etc.). Le contenu est stocké en base (bytea) plutôt que sur le disque de l'instance : le
// backend tourne sur Render sans volume persistant, un stockage disque serait perdu à chaque
// redéploiement/redémarrage. La table est créée automatiquement (synchronize: true).
@Entity('fichiers_verification_veille')
export class FichierVerificationVeille {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  patientId: string;

  // Renseigné dès que la vérification veille du patient est validée (rattachement en masse
  // dans VerificationVeilleService.create) — les fichiers importés avant validation sont
  // conservés, simplement non encore rattachés à l'enregistrement.
  @Index()
  @Column({ nullable: true })
  verificationVeilleId: string | null;

  @Column()
  nomOriginal: string;

  @Column()
  mimeType: string;

  @Column()
  tailleOctets: number;

  @Column({ type: 'bytea' })
  contenu: Buffer;

  // userId central (SSO) de la personne ayant importé le fichier.
  @Column({ nullable: true })
  telechargeParId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
