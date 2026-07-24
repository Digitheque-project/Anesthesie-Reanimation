import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoriqueModification } from '../entities/historique-modification.entity';

@Injectable()
export class TracabiliteService {
  constructor(
    @InjectRepository(HistoriqueModification)
    private repo: Repository<HistoriqueModification>,
  ) {}

  async log(
    entite: string,
    entiteId: string,
    action: string,
    details?: any,
    utilisateurId?: string,
  ) {
    return this.repo.save(
      this.repo.create({
        entite,
        entiteId,
        action,
        details: JSON.stringify(details),
        utilisateurId,
      }),
    );
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
