import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BonCommandeAnesthesie } from '../entities/bon-commande-anesthesie.entity';
import { ItemCommande } from '../entities/item-commande.entity';
import { CreateBonCommandeDto } from './dto/create-bon-commande.dto';
import { UpdateBonCommandeDto } from './dto/update-bon-commande.dto';

@Injectable()
export class BonCommandeService {
  constructor(
    @InjectRepository(BonCommandeAnesthesie) private bonRepo: Repository<BonCommandeAnesthesie>,
    @InjectRepository(ItemCommande) private itemRepo: Repository<ItemCommande>,
  ) {}
  async create(dto: CreateBonCommandeDto): Promise<BonCommandeAnesthesie> {
    const { items, ...data } = dto as any;
    const bon = this.bonRepo.create(data);
    const bonSaved = await this.bonRepo.save(bon); const saved = Array.isArray(bonSaved) ? bonSaved[0] : bonSaved;
    if (items?.length) await this.itemRepo.save(items.map((i: any) => this.itemRepo.create({ ...i, bonCommande: saved })));
    return this.findOne(saved.id);
  }
  async findAll(page = 1, limite = 10) {
    const [data, total] = await this.bonRepo.findAndCount({ relations: ['patient', 'vpa', 'chirurgien', 'anesthesiste', 'items'], skip: (page - 1) * limite, take: limite, order: { createdAt: 'DESC' } });
    return { data, total, page, pages: Math.ceil(total / limite) };
  }
  async findOne(id: string): Promise<BonCommandeAnesthesie> {
    const bon = await this.bonRepo.findOne({ where: { id }, relations: ['patient', 'vpa', 'chirurgien', 'anesthesiste', 'items'] });
    if (!bon) throw new NotFoundException(`Bon ${id} non trouvé`);
    return bon;
  }
  async update(id: string, dto: UpdateBonCommandeDto): Promise<BonCommandeAnesthesie> { const bon = await this.findOne(id); return this.bonRepo.save(Object.assign(bon, dto)); }
  async remove(id: string): Promise<{ message: string }> { await this.findOne(id); await this.bonRepo.delete(id); return { message: 'Bon supprimé' }; }
}
