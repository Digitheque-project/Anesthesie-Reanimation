import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScoreSCCRE } from '../entities/score-sccre.entity';
import { AccueilClient } from '../external/accueil.client';
import { MedecinIdentiteService } from '../medecin/medecin-identite.service';
import { CentralUser } from '../central-auth/central-user.interface';
import { CreateScoreSCCREDto } from './dto/create-score-sccre.dto';
import { UpdateScoreSCCREDto } from './dto/update-score-sccre.dto';

@Injectable()
export class ScoreSCCREService {
  constructor(
    @InjectRepository(ScoreSCCRE) private repo: Repository<ScoreSCCRE>,
    private accueilClient: AccueilClient,
    private medecinIdentiteService: MedecinIdentiteService,
  ) {}

  // L'anesthésiste évaluant le réveil est toujours celui connecté (route réservée au rôle
  // ANESTHESISTE) — jamais une saisie manuelle du client, comme pour la CPA
  // (CPAService.create). Son identité SSO (userId central) sert directement de référence,
  // plus besoin d'une fiche Médecin locale préalable.
  async create(
    dto: CreateScoreSCCREDto,
    centralUser: CentralUser,
  ): Promise<ScoreSCCRE> {
    const saved = await this.repo.save(
      this.repo.create({ ...(dto as any), anesthesisteId: centralUser.userId }),
    );
    return Array.isArray(saved) ? saved[0] : saved;
  }
  async findAll(page = 1, limite = 10) {
    const [data, total] = await this.repo.findAndCount({
      skip: (page - 1) * limite,
      take: limite,
      order: { createdAt: 'DESC' },
    });
    const enrichedPatient = await this.accueilClient.enrichWithIdentity(data);
    const enriched = await this.medecinIdentiteService.enrichir(
      enrichedPatient,
      'anesthesisteId',
      'anesthesiste',
    );
    return { data: enriched, total, page, pages: Math.ceil(total / limite) };
  }
  async findOne(id: string): Promise<any> {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException(`Score ${id} non trouvé`);
    const [enrichedPatient] = await this.accueilClient.enrichWithIdentity([s]);
    const [enriched] = await this.medecinIdentiteService.enrichir(
      [enrichedPatient],
      'anesthesisteId',
      'anesthesiste',
    );
    return enriched;
  }
  async update(id: string, dto: UpdateScoreSCCREDto): Promise<ScoreSCCRE> {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException(`Score ${id} non trouvé`);
    return this.repo.save(Object.assign(s, dto));
  }
  async remove(id: string): Promise<{ message: string }> {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException(`Score ${id} non trouvé`);
    await this.repo.delete(id);
    return { message: 'Score supprimé' };
  }
}
