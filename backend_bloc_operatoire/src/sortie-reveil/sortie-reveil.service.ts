import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SortieReveil } from '../entities/sortie-reveil.entity';
import { AccueilClient } from '../external/accueil.client';
import { MedecinService } from '../medecin/medecin.service';
import { CentralUser } from '../central-auth/central-user.interface';
import { CreateSortieReveilDto } from './dto/create-sortie-reveil.dto';
import { UpdateSortieReveilDto } from './dto/update-sortie-reveil.dto';

@Injectable()
export class SortieReveilService {
  constructor(
    @InjectRepository(SortieReveil) private repo: Repository<SortieReveil>,
    private accueilClient: AccueilClient,
    private medecinService: MedecinService,
  ) {}

  // Le médecin autorisant la sortie est toujours l'anesthésiste connecté (route réservée au
  // rôle ANESTHESISTE) — même logique que ScoreSCCREService.create.
  async create(dto: CreateSortieReveilDto, centralUser: CentralUser): Promise<SortieReveil> {
    const medecin = await this.medecinService.findByEmail(centralUser.email);
    if (!medecin) {
      throw new BadRequestException(
        `Aucune fiche Médecin ne correspond à votre compte (${centralUser.email}). Contactez un administrateur pour la créer.`,
      );
    }

    const saved = await this.repo.save(this.repo.create({ ...(dto as any), medecinId: medecin.id }));
    return Array.isArray(saved) ? saved[0] : saved;
  }
  async findAll(page = 1, limite = 10) {
    const [data, total] = await this.repo.findAndCount({ relations: ['scoreSCCRE', 'medecin'], skip: (page - 1) * limite, take: limite, order: { createdAt: 'DESC' } });
    const enriched = await this.accueilClient.enrichWithIdentity(data);
    return { data: enriched, total, page, pages: Math.ceil(total / limite) };
  }
  async findOne(id: string): Promise<any> {
    const s = await this.repo.findOne({ where: { id }, relations: ['scoreSCCRE', 'medecin'] });
    if (!s) throw new NotFoundException(`Sortie ${id} non trouvée`);
    const [enriched] = await this.accueilClient.enrichWithIdentity([s]);
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
