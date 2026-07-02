import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationCPA, StatutNotificationCPA } from '../entities/notification-cpa.entity';
import { WebhookNotification } from '../entities/webhook-notification.entity';
import { AccueilClient } from '../external/accueil.client';
import { CreateNotificationCPADto } from './dto/create-notification-cpa.dto';
import { UpdateNotificationCPADto } from './dto/update-notification-cpa.dto';

@Injectable()
export class NotificationCPAService {
  constructor(
    @InjectRepository(NotificationCPA)
    private readonly notificationRepo: Repository<NotificationCPA>,
    @InjectRepository(WebhookNotification)
    private readonly webhookRepo: Repository<WebhookNotification>,
    private accueilClient: AccueilClient,
  ) {}

  async create(dto: CreateNotificationCPADto): Promise<NotificationCPA> {
    const saved = await this.notificationRepo.save(this.notificationRepo.create(dto));
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async findAll(page = 1, limite = 10) {
    // 1. Récupérer les notifications internes
    const [internalDataRaw, internalTotal] = await this.notificationRepo.findAndCount({
      relations: ['chirurgien'],
      skip: (page - 1) * limite,
      take: limite,
      order: { createdAt: 'DESC' },
    });
    const internalData = await this.accueilClient.enrichWithIdentity(internalDataRaw);

    // 2. Récupérer les notifications externes
    const externalData = await this.webhookRepo.find({
      order: { receivedAt: 'DESC' },
      take: limite,
    });

    // 3. Fusionner et trier (avec gestion des dates)
    const merged = [...internalData, ...externalData];
    merged.sort((a, b) => {
      // Extraire la date selon le type
      const getDate = (item: any) => {
        if (item.createdAt) return new Date(item.createdAt).getTime();
        if (item.receivedAt) return new Date(item.receivedAt).getTime();
        return 0;
      };
      return getDate(b) - getDate(a);
    });

    // 4. Paginer
    const start = (page - 1) * limite;
    const end = start + limite;
    const paginated = merged.slice(start, end);

    return {
      data: paginated,
      total: merged.length,
      page,
      pages: Math.ceil(merged.length / limite),
    };
  }

  async findOne(id: string): Promise<any> {
    const n = await this.notificationRepo.findOne({ where: { id }, relations: ['chirurgien'] });
    if (!n) throw new NotFoundException(`Notification ${id} non trouvée`);
    const [enriched] = await this.accueilClient.enrichWithIdentity([n]);
    return enriched;
  }

  async planifierRDV(id: string, dto: any): Promise<NotificationCPA> {
    const n = await this.notificationRepo.findOne({ where: { id } });
    if (!n) throw new NotFoundException(`Notification ${id} non trouvée`);
    n.statut = StatutNotificationCPA.RDV_PLANIFIE;
    return this.notificationRepo.save(n);
  }

  async update(id: string, dto: UpdateNotificationCPADto): Promise<NotificationCPA> {
    const n = await this.notificationRepo.findOne({ where: { id } });
    if (!n) throw new NotFoundException(`Notification ${id} non trouvée`);
    return this.notificationRepo.save(Object.assign(n, dto));
  }

  async remove(id: string): Promise<{ message: string }> {
    const n = await this.notificationRepo.findOne({ where: { id } });
    if (!n) throw new NotFoundException(`Notification ${id} non trouvée`);
    await this.notificationRepo.delete(id);
    return { message: 'Notification supprimée' };
  }

  async getUnreadCount(): Promise<number> {
    const internalUnread = await this.notificationRepo.count({
      where: { statut: StatutNotificationCPA.EN_ATTENTE },
    });
    const externalUnread = await this.webhookRepo.count({
      where: { processed: false },
    });
    return internalUnread + externalUnread;
  }
}
