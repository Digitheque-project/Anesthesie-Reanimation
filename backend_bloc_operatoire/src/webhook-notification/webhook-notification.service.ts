import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationCPA, StatutNotificationCPA } from '../entities/notification-cpa.entity';

@Injectable()
export class WebhookNotificationService {
  private readonly logger = new Logger(WebhookNotificationService.name);

  constructor(
    @InjectRepository(NotificationCPA)
    private readonly notificationRepo: Repository<NotificationCPA>,
  ) {}

  async processIncomingNotification(payload: any, sourceService?: string): Promise<boolean> {
    this.logger.log(`📦 Webhook reçu: ${JSON.stringify(payload)}`);

    try {
      const motif = payload.motif || payload.message || 'Notification externe';
      const patientId = payload.patientId || payload.targetId || 'webhook-inconnu';
      const urgence = payload.urgence === 3 || payload.estUrgent === true;

      const newNotification = this.notificationRepo.create({
        heurePrescription: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        patientId: patientId,
        intervention: motif,
        chirurgienId: payload.sourceServiceId || payload.chirurgienId || null,
        professeurCPA: payload.sourceServiceName || sourceService || 'Service externe',
        estUrgent: urgence,
        statut: StatutNotificationCPA.EN_ATTENTE,
      });

      const saved = await this.notificationRepo.save(newNotification);
      this.logger.log(`✅ Notification externe stockée (ID: ${saved.id})`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Erreur stockage: ${error.message}`);
      return false;
    }
  }
}
