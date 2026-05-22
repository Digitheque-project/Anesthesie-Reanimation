import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProtocoleOperatoire } from '../entities/protocole-operatoire.entity';
import { Drainage } from '../entities/drainage.entity';
import { CreateProtocoleOperatoireDto } from './dto/create-protocole-operatoire.dto';
import { UpdateProtocoleOperatoireDto } from './dto/update-protocole-operatoire.dto';

@Injectable()
export class ProtocoleOperatoireService {
  constructor(
    @InjectRepository(ProtocoleOperatoire) private repo: Repository<ProtocoleOperatoire>,
    @InjectRepository(Drainage) private drainageRepo: Repository<Drainage>,
  ) {}
  async create(dto: CreateProtocoleOperatoireDto): Promise<ProtocoleOperatoire> {
    const { drainages, ...data } = dto as any;
    const proto = this.repo.create(data);
    const protoSaved = await this.repo.save(proto); const saved = Array.isArray(protoSaved) ? protoSaved[0] : protoSaved;
    if (drainages?.length) await this.drainageRepo.save(drainages.map((d: any) => this.drainageRepo.create({ ...d, protocole: saved })));
    return this.findOne(saved.id);
  }
  async findAll(page = 1, limite = 10) {
    const [data, total] = await this.repo.findAndCount({ relations: ['patient', 'chirurgien', 'anesthesiste', 'infirmiere', 'aideOperatoire', 'drainages'], skip: (page - 1) * limite, take: limite, order: { createdAt: 'DESC' } });
    return { data, total, page, pages: Math.ceil(total / limite) };
  }
  async findOne(id: string): Promise<ProtocoleOperatoire> {
    const p = await this.repo.findOne({ where: { id }, relations: ['patient', 'chirurgien', 'anesthesiste', 'infirmiere', 'aideOperatoire', 'drainages'] });
    if (!p) throw new NotFoundException(`Protocole ${id} non trouvé`);
    return p;
  }
  async update(id: string, dto: UpdateProtocoleOperatoireDto): Promise<ProtocoleOperatoire> { const p = await this.findOne(id); return this.repo.save(Object.assign(p, dto)); }
  async remove(id: string): Promise<{ message: string }> { await this.findOne(id); await this.repo.delete(id); return { message: 'Protocole supprimé' }; }
}
