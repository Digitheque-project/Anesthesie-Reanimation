import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { CategorieMoment } from './moment-operatoire.entity';

// Catalogue des boutons de la chronologie opératoire (MomentsTimeline). Historiquement codé en
// dur côté frontend ; devenu une table pour permettre à chaque rôle d'ajouter un bouton
// réutilisable à sa propre catégorie, sans déploiement. Le catalogue de base (Anesthésie/
// Chirurgie/Divers) est inséré au démarrage si la table est vide — voir
// MomentsCatalogueService.onModuleInit.
@Entity('moments_catalogue')
export class MomentCatalogueEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'enum', enum: CategorieMoment })
  categorie: CategorieMoment;

  @Column()
  label: string;

  @Column({ type: 'varchar', nullable: true })
  creeParNom: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
