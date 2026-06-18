import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookNotification } from '../entities/webhook-notification.entity';

@Injectable()
export class WebhookNotificationService {
  private readonly logger = new Logger(WebhookNotificationService.name);

  constructor(
    @InjectRepository(WebhookNotification)
    private readonly webhookRepo: Repository<WebhookNotification>,
  ) {}

  async processIncomingNotification(payload: any, sourceService?: string): Promise<boolean> {
    this.logger.log(`📦 Webhook reçu: ${JSON.stringify(payload)}`);

    try {
      const notification = this.webhookRepo.create({
        type: payload.type,
        motif: payload.motif || payload.message,
        patientId: payload.patientId || payload.targetId,
        sourceServiceId: payload.sourceServiceId,
        sourceServiceName: payload.sourceServiceName || sourceService,
        targetServiceId: payload.targetServiceId,
        targetServiceName: payload.targetServiceName,
        urgence: payload.urgence,
        payload: payload.payload,
        channels: payload.channels,
        processed: false, // ✅ initialisé à false pour être compté comme non lu
      });

      await this.webhookRepo.save(notification);
      this.logger.log(`✅ Notification stockée dans webhook_notifications (ID: ${notification.id})`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Erreur: ${error.message}`);
      return true;
    }
  }

  async getUnreadCount(): Promise<number> {
    return this.webhookRepo.count({ where: { processed: false } });
  }
}
