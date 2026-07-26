import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoriqueModification } from '../entities/historique-modification.entity';

@Injectable()
export class TracabiliteService {
  private readonly logger = new Logger(TracabiliteService.name);

  constructor(
    @InjectRepository(HistoriqueModification)
    private repo: Repository<HistoriqueModification>,
  ) {}

  // Appelé depuis une dizaine de services métier (CPA, check-lists, sortie, changements de
  // statut...) : ne doit jamais faire échouer l'action clinique en cours si l'écriture du journal
  // échoue elle-même (ex. incident DB ponctuel) — on avale l'erreur et on logge, plutôt que de
  // remonter une exception qui bloquerait la vraie action.
  async log(
    entite: string,
    entiteId: string,
    action: string,
    details?: any,
    utilisateurId?: string,
  ) {
    try {
      return await this.repo.save(
        this.repo.create({
          entite,
          entiteId,
          action,
          details: JSON.stringify(details),
          utilisateurId,
        }),
      );
    } catch (err) {
      this.logger.error(
        `Échec d'écriture du journal de traçabilité (${entite}/${entiteId}/${action}): ${(err as Error).message}`,
      );
      return null;
    }
  }

  async getHistorique(entite: string, entiteId: string) {
    return this.repo.find({
      where: { entite, entiteId },
      order: { createdAt: 'DESC' },
    });
  }

  async getTousHistoriques(page = 1, limite = 20) {
    const [data, total] = await this.repo.findAndCount({
      skip: (page - 1) * limite,
      take: limite,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, pages: Math.ceil(total / limite) };
  }
}
