import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationCPA, StatutNotificationCPA } from '../entities/notification-cpa.entity';
import { CreateNotificationCPADto } from './dto/create-notification-cpa.dto';
import { UpdateNotificationCPADto } from './dto/update-notification-cpa.dto';

@Injectable()
export class NotificationCPAService {
  constructor(@InjectRepository(NotificationCPA) private repo: Repository<NotificationCPA>) {}

  async create(dto: CreateNotificationCPADto): Promise<NotificationCPA> {
    const saved = await this.repo.save(this.repo.create(dto));
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async findAll(page = 1, limite = 10) {
    const [data, total] = await this.repo.findAndCount({
      relations: ['patient', 'chirurgien'],
      skip: (page - 1) * limite,
      take: limite,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, pages: Math.ceil(total / limite) };
  }

  async findOne(id: string): Promise<NotificationCPA> {
    const n = await this.repo.findOne({ where: { id }, relations: ['patient', 'chirurgien'] });
    if (!n) throw new NotFoundException(`Notification ${id} non trouvée`);
    return n;
  }

  async planifierRDV(id: string, dto: any): Promise<NotificationCPA> {
    const n = await this.findOne(id);
    n.statut = StatutNotificationCPA.RDV_PLANIFIE;
    // Stocker les infos de planification
    n.heurePrescription = dto.heureRDV || n.heurePrescription;
    return this.repo.save(n);
  }

  async update(id: string, dto: UpdateNotificationCPADto): Promise<NotificationCPA> {
    const n = await this.findOne(id);
    return this.repo.save(Object.assign(n, dto));
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.repo.delete(id);
    return { message: 'Notification supprimée' };
  }
}
