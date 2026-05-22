import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivitePerOp } from '../entities/activite-per-op.entity';
import { ConstantePerOp } from '../entities/constante-per-op.entity';
import { CreateActivitePerOpDto } from './dto/create-activite-per-op.dto';
import { UpdateActivitePerOpDto } from './dto/update-activite-per-op.dto';

@Injectable()
export class ActivitePerOpService {
  constructor(
    @InjectRepository(ActivitePerOp) private repo: Repository<ActivitePerOp>,
    @InjectRepository(ConstantePerOp) private constanteRepo: Repository<ConstantePerOp>,
  ) {}
  async create(dto: CreateActivitePerOpDto): Promise<ActivitePerOp> {
    const { constantes, ...data } = dto as any;
    const activite = this.repo.create(data);
    const activiteSaved = await this.repo.save(activite); const saved = Array.isArray(activiteSaved) ? activiteSaved[0] : activiteSaved;
    if (constantes?.length) await this.constanteRepo.save(constantes.map((c: any) => this.constanteRepo.create({ ...c, activitePerOp: saved })));
    return this.findOne(saved.id);
  }
  async findAll(page = 1, limite = 10) {
    const [data, total] = await this.repo.findAndCount({ relations: ['patient', 'chirurgien', 'anesthesiste', 'constantes'], skip: (page - 1) * limite, take: limite, order: { createdAt: 'DESC' } });
    return { data, total, page, pages: Math.ceil(total / limite) };
  }
  async findOne(id: string): Promise<ActivitePerOp> {
    const a = await this.repo.findOne({ where: { id }, relations: ['patient', 'chirurgien', 'anesthesiste', 'constantes'] });
    if (!a) throw new NotFoundException(`Activité ${id} non trouvée`);
    return a;
  }
  async update(id: string, dto: UpdateActivitePerOpDto): Promise<ActivitePerOp> { const a = await this.findOne(id); return this.repo.save(Object.assign(a, dto)); }
  async remove(id: string): Promise<{ message: string }> { await this.findOne(id); await this.repo.delete(id); return { message: 'Activité supprimée' }; }
}
