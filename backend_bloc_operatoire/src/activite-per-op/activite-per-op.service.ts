import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivitePerOp } from '../entities/activite-per-op.entity';
import { ConstantePerOp } from '../entities/constante-per-op.entity';
import { AccueilClient } from '../external/accueil.client';
import { CreateActivitePerOpDto } from './dto/create-activite-per-op.dto';
import { UpdateActivitePerOpDto } from './dto/update-activite-per-op.dto';

@Injectable()
export class ActivitePerOpService {
  constructor(
    @InjectRepository(ActivitePerOp) private repo: Repository<ActivitePerOp>,
    @InjectRepository(ConstantePerOp) private constanteRepo: Repository<ConstantePerOp>,
    private accueilClient: AccueilClient,
  ) {}

  async create(dto: CreateActivitePerOpDto): Promise<ActivitePerOp> {
    const { constantes, ...data } = dto;
    
    // Créer l'activité per-op
    const activite = this.repo.create(data);
    const activiteSaved = await this.repo.save(activite);
    const saved = Array.isArray(activiteSaved) ? activiteSaved[0] : activiteSaved;

    // ✅ Ajouter toutes les constantes (surveillances multiples)
    if (constantes && constantes.length > 0) {
      const constantesEntities = constantes.map(c => 
        this.constanteRepo.create({ 
          ...c, 
          activitePerOp: saved 
        })
      );
      await this.constanteRepo.save(constantesEntities);
      console.log(`✅ ${constantesEntities.length} mesures de constantes enregistrées`);
    }

    return this.findOne(saved.id);
  }

  async findAll(page = 1, limite = 10) {
    const [data, total] = await this.repo.findAndCount({
      relations: ['chirurgien', 'anesthesiste', 'constantes'],
      skip: (page - 1) * limite,
      take: limite,
      order: { createdAt: 'DESC' },
    });
    const enriched = await this.accueilClient.enrichWithIdentity(data);
    return { data: enriched, total, page, pages: Math.ceil(total / limite) };
  }

  async findOne(id: string): Promise<any> {
    const a = await this.repo.findOne({
      where: { id },
      relations: ['chirurgien', 'anesthesiste', 'constantes'],
    });
    if (!a) throw new NotFoundException(`Activité ${id} non trouvée`);
    const [enriched] = await this.accueilClient.enrichWithIdentity([a]);
    return enriched;
  }

  async update(id: string, dto: UpdateActivitePerOpDto): Promise<ActivitePerOp> {
    const a = await this.repo.findOne({ where: { id } });
    if (!a) throw new NotFoundException(`Activité ${id} non trouvée`);
    return this.repo.save(Object.assign(a, dto));
  }

  async remove(id: string): Promise<{ message: string }> {
    const a = await this.repo.findOne({ where: { id } });
    if (!a) throw new NotFoundException(`Activité ${id} non trouvée`);
    await this.repo.delete(id);
    return { message: 'Activité supprimée' };
  }
}
