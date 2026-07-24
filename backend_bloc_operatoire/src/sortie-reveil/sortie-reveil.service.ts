import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SortieReveil } from '../entities/sortie-reveil.entity';
import { AccueilClient } from '../external/accueil.client';
import { MedecinIdentiteService } from '../medecin/medecin-identite.service';
import { CentralUser } from '../central-auth/central-user.interface';
import { CreateSortieReveilDto } from './dto/create-sortie-reveil.dto';
import { UpdateSortieReveilDto } from './dto/update-sortie-reveil.dto';

@Injectable()
export class SortieReveilService {
  constructor(
    @InjectRepository(SortieReveil) private repo: Repository<SortieReveil>,
    private accueilClient: AccueilClient,
    private medecinIdentiteService: MedecinIdentiteService,
  ) {}

  // Le médecin autorisant la sortie est toujours l'anesthésiste connecté (route réservée au
  // rôle ANESTHESISTE) — son identité SSO (userId central) sert directement de référence, plus
  // besoin d'une fiche Médecin locale préalable. Même logique que CPAService.create.
  async create(
    dto: CreateSortieReveilDto,
    centralUser: CentralUser,
  ): Promise<SortieReveil> {
    const saved = await this.repo.save(
      this.repo.create({ ...(dto as any), medecinId: centralUser.userId }),
    );
    return Array.isArray(saved) ? saved[0] : saved;
  }
  async findAll(page = 1, limite = 10) {
    const [data, total] = await this.repo.findAndCount({
      relations: ['scoreSCCRE'],
      skip: (page - 1) * limite,
      take: limite,
      order: { createdAt: 'DESC' },
    });
    const enrichedPatient = await this.accueilClient.enrichWithIdentity(data);
    const enriched = await this.medecinIdentiteService.enrichir(
      enrichedPatient,
      'medecinId',
      'medecin',
    );
    return { data: enriched, total, page, pages: Math.ceil(total / limite) };
  }
  async findOne(id: string): Promise<any> {
    const s = await this.repo.findOne({
      where: { id },
      relations: ['scoreSCCRE'],
    });
    if (!s) throw new NotFoundException(`Sortie ${id} non trouvée`);
    const [enrichedPatient] = await this.accueilClient.enrichWithIdentity([s]);
    const [enriched] = await this.medecinIdentiteService.enrichir(
      [enrichedPatient],
      'medecinId',
      'medecin',
    );
    return enriched;
  }
  async update(id: string, dto: UpdateSortieReveilDto): Promise<SortieReveil> {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException(`Sortie ${id} non trouvée`);
    return this.repo.save(Object.assign(s, dto));
  }
  async remove(id: string): Promise<{ message: string }> {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException(`Sortie ${id} non trouvée`);
    await this.repo.delete(id);
    return { message: 'Sortie supprimée' };
  }
}
