import {
  Injectable,
  Logger,
  OnModuleInit,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MomentCatalogueEntry } from '../entities/moment-catalogue-entry.entity';
import { CategorieMoment } from '../entities/moment-operatoire.entity';
import { CentralUser } from '../central-auth/central-user.interface';
import { matchRoleClinique, RoleClinique } from '../central-auth/role-clinique';
import { CreateMomentCatalogueEntryDto } from './dto/create-moment-catalogue-entry.dto';

// Catalogue de base, repris de l'ancien fichier statique frontend
// (blocope-front/lib/data/catalogue-moments-operatoires.ts) — sert uniquement de semence au
// premier démarrage (table vide), pour préserver le comportement existant sans migration
// manuelle (TypeORM `synchronize: true` crée déjà la table).
const CATALOGUE_INITIAL: Record<CategorieMoment, string[]> = {
  [CategorieMoment.ANESTHESIE]: [
    'Pose voie veineuse',
    'Induction anesthésique',
    'Intubation',
    'Extubation',
    'Réveil anesthésique',
  ],
  [CategorieMoment.CHIRURGIE]: [
    'Incision',
    'Ouverture',
    'Exploration',
    'Début du geste principal',
    'Fin du geste principal',
    'Hémostase',
    'Fermeture pariétale',
    'Fermeture cutanée',
    'Pansement',
  ],
  [CategorieMoment.DIVERS]: [
    'Antibioprophylaxie administrée',
    'Début transfusion',
    'Fin transfusion',
    'Incident / complication',
    'Sortie de salle',
  ],
};

// Même séparation stricte par rôle que MomentsOperatoireService : chacun ne peut ajouter un
// bouton qu'à la/les catégorie(s) qu'il a le droit d'horodater.
const CATEGORIES_AUTORISEES: Record<string, CategorieMoment[]> = {
  [RoleClinique.ANESTHESISTE]: [CategorieMoment.ANESTHESIE],
  [RoleClinique.IBODE]: [CategorieMoment.CHIRURGIE, CategorieMoment.DIVERS],
};

@Injectable()
export class MomentsCatalogueService implements OnModuleInit {
  private readonly logger = new Logger(MomentsCatalogueService.name);

  constructor(
    @InjectRepository(MomentCatalogueEntry)
    private repo: Repository<MomentCatalogueEntry>,
  ) {}

  async onModuleInit() {
    const total = await this.repo.count();
    if (total > 0) return;
    const seed = (Object.keys(CATALOGUE_INITIAL) as CategorieMoment[]).flatMap(
      (categorie) =>
        CATALOGUE_INITIAL[categorie].map((label) =>
          this.repo.create({ categorie, label }),
        ),
    );
    await this.repo.save(seed);
    this.logger.log(
      `Catalogue de moments opératoires initialisé (${seed.length} entrées).`,
    );
  }

  async findAll(): Promise<MomentCatalogueEntry[]> {
    // Le plus récent en premier — un bouton ajouté doit apparaître en tête.
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async create(
    dto: CreateMomentCatalogueEntryDto,
    centralUser: CentralUser,
  ): Promise<MomentCatalogueEntry> {
    const role = matchRoleClinique(centralUser.role);
    const autorisees = role ? CATEGORIES_AUTORISEES[role] : undefined;
    if (!autorisees || !autorisees.includes(dto.categorie)) {
      throw new ForbiddenException(
        `Votre rôle (${centralUser.role}) ne peut pas ajouter de bouton à la catégorie ${dto.categorie}.`,
      );
    }
    const entry = this.repo.create({
      categorie: dto.categorie,
      label: dto.label.trim(),
      creeParNom: `${centralUser.prenom} ${centralUser.nom}`.trim(),
    });
    return this.repo.save(entry);
  }
}
