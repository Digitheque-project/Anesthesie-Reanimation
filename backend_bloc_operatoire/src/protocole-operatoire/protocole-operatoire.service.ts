import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProtocoleOperatoire } from '../entities/protocole-operatoire.entity';
import { Drainage } from '../entities/drainage.entity';
import { AccueilClient } from '../external/accueil.client';
import { OperationGateway } from '../operation-gateway/operation.gateway';
import { CreateProtocoleOperatoireDto } from './dto/create-protocole-operatoire.dto';
import { UpdateProtocoleOperatoireDto } from './dto/update-protocole-operatoire.dto';

@Injectable()
export class ProtocoleOperatoireService {
  constructor(
    @InjectRepository(ProtocoleOperatoire) private repo: Repository<ProtocoleOperatoire>,
    @InjectRepository(Drainage) private drainageRepo: Repository<Drainage>,
    private accueilClient: AccueilClient,
    private gateway: OperationGateway,
  ) {}
  async create(dto: CreateProtocoleOperatoireDto): Promise<ProtocoleOperatoire> {
    const { drainages, ...data } = dto as any;
    const proto = this.repo.create(data);
    const protoSaved = await this.repo.save(proto); const saved = Array.isArray(protoSaved) ? protoSaved[0] : protoSaved;
    if (drainages?.length) await this.drainageRepo.save(drainages.map((d: any) => this.drainageRepo.create({ ...d, protocole: saved })));
    const complet = await this.findOne(saved.id);
    this.gateway.emitToOperation(complet.patientId, 'protocole-operatoire:maj', { patientId: complet.patientId, protocole: complet });
    return complet;
  }
  async findAll(page = 1, limite = 10) {
    const [data, total] = await this.repo.findAndCount({ relations: ['chirurgien', 'anesthesiste', 'infirmiere', 'aideOperatoire', 'drainages'], skip: (page - 1) * limite, take: limite, order: { createdAt: 'DESC' } });
    const enriched = await this.accueilClient.enrichWithIdentity(data);
    return { data: enriched, total, page, pages: Math.ceil(total / limite) };
  }
  async findOne(id: string): Promise<any> {
    const p = await this.repo.findOne({ where: { id }, relations: ['chirurgien', 'anesthesiste', 'infirmiere', 'aideOperatoire', 'drainages'] });
    if (!p) throw new NotFoundException(`Protocole ${id} non trouvé`);
    const [enriched] = await this.accueilClient.enrichWithIdentity([p]);
    return enriched;
  }
  async update(id: string, dto: UpdateProtocoleOperatoireDto): Promise<ProtocoleOperatoire> {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException(`Protocole ${id} non trouvé`);
    const updated = await this.repo.save(Object.assign(p, dto));
    this.gateway.emitToOperation(updated.patientId, 'protocole-operatoire:maj', { patientId: updated.patientId, protocole: updated });
    return updated;
  }
  async remove(id: string): Promise<{ message: string }> {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException(`Protocole ${id} non trouvé`);
    await this.repo.delete(id);
    return { message: 'Protocole supprimé' };
  }
}
