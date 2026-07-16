import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { NotificationCPA, StatutNotificationCPA } from '../entities/notification-cpa.entity';
import { WebhookNotification } from '../entities/webhook-notification.entity';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { AccueilClient } from '../external/accueil.client';
import { NotificationOutgoingService } from '../external/notification-outgoing.service';
import { CreateNotificationCPADto } from './dto/create-notification-cpa.dto';
import { UpdateNotificationCPADto } from './dto/update-notification-cpa.dto';

@Injectable()
export class NotificationCPAService {
  private readonly logger = new Logger(NotificationCPAService.name);

  constructor(
    @InjectRepository(NotificationCPA)
    private readonly notificationRepo: Repository<NotificationCPA>,
    @InjectRepository(WebhookNotification)
    private readonly webhookRepo: Repository<WebhookNotification>,
    @InjectRepository(PatientBloc)
    private readonly patientBlocRepo: Repository<PatientBloc>,
    private accueilClient: AccueilClient,
    private notificationOutgoing: NotificationOutgoingService,
  ) {}

  async create(dto: CreateNotificationCPADto): Promise<NotificationCPA> {
    const saved = await this.notificationRepo.save(this.notificationRepo.create(dto));
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async findAll(page = 1, limite = 10) {
    const [internalDataRaw, internalTotal] = await this.notificationRepo.findAndCount({
      relations: ['chirurgien'],
      skip: (page - 1) * limite,
      take: limite,
      order: { createdAt: 'DESC' },
    });
    const identities = await this.accueilClient.enrichWithIdentity(internalDataRaw);
    const patientIds = Array.from(new Set(internalDataRaw.map((n) => n.patientId).filter(Boolean)));
    const patients = patientIds.length
      ? await this.patientBlocRepo.find({ where: { patientId: In(patientIds) } })
      : [];
    const patientMap = new Map(patients.map((p) => [p.patientId, p]));
    const internalData = internalDataRaw.map((n, idx) => {
      const identity = identities[idx] || {};
      const pb = patientMap.get(n.patientId);
      return {
        ...n,
        patient: {
          id: n.patientId,
          nom: identity.nom,
          prenom: identity.prenom,
          idDossier: identity.idDossier ?? pb?.idDossier,
          statut: pb?.statut,
          niveauUrgence: pb?.niveauUrgence,
        },
      };
    });

    const externalData = await this.webhookRepo.find({
      order: { receivedAt: 'DESC' },
      take: limite,
    });

    const merged = [...internalData, ...externalData];
    merged.sort((a, b) => {
      const getDate = (item: any) => {
        if (item.createdAt) return new Date(item.createdAt).getTime();
        if (item.receivedAt) return new Date(item.receivedAt).getTime();
        return 0;
      };
      return getDate(b) - getDate(a);
    });

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

    try {
      const patient = await this.patientBlocRepo.findOne({ where: { patientId: n.patientId } });
      if (patient?.serviceOrigineId && patient?.serviceOrigine) {
        await this.notificationOutgoing.notifyOriginService({
          patientId: n.patientId,
          type: 'RDV_CPA_PLANIFIE',
          serviceOrigineId: patient.serviceOrigineId,
          serviceOrigineName: patient.serviceOrigine,
          payload: {
            intervention: n.intervention,
            professeurCPA: n.professeurCPA,
            estUrgent: n.estUrgent,
            datePlanification: new Date().toISOString(),
          },
        });
      }
    } catch (err) {
      this.logger.error(`Erreur notification service origine après planification RDV CPA: ${(err as Error).message}`);
    }

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
