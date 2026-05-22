import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScoreSCCRE } from '../entities/score-sccre.entity';
import { CreateScoreSCCREDto } from './dto/create-score-sccre.dto';
import { UpdateScoreSCCREDto } from './dto/update-score-sccre.dto';

@Injectable()
export class ScoreSCCREService {
  constructor(@InjectRepository(ScoreSCCRE) private repo: Repository<ScoreSCCRE>) {}
  async create(dto: CreateScoreSCCREDto): Promise<ScoreSCCRE> { const saved = await this.repo.save(this.repo.create(dto as any)); return Array.isArray(saved) ? saved[0] : saved; }
  async findAll(page = 1, limite = 10) {
    const [data, total] = await this.repo.findAndCount({ relations: ['patient', 'anesthesiste'], skip: (page - 1) * limite, take: limite, order: { createdAt: 'DESC' } });
    return { data, total, page, pages: Math.ceil(total / limite) };
  }
  async findOne(id: string): Promise<ScoreSCCRE> {
    const s = await this.repo.findOne({ where: { id }, relations: ['patient', 'anesthesiste'] });
    if (!s) throw new NotFoundException(`Score ${id} non trouvé`);
    return s;
  }
  async update(id: string, dto: UpdateScoreSCCREDto): Promise<ScoreSCCRE> { const s = await this.findOne(id); return this.repo.save(Object.assign(s, dto)); }
  async remove(id: string): Promise<{ message: string }> { await this.findOne(id); await this.repo.delete(id); return { message: 'Score supprimé' }; }
}
