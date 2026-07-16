import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

// Client vers le service central "Notifications" (WebSocket temps réel, multi-service).
// Les clients frontend se connectent en WS sur {baseUrl}/notifications avec ?serviceId=...
// et reçoivent un évènement "notification" pour chaque appel à notifyService ci-dessous.
@Injectable()
export class NotificationBackClient {
  private readonly logger = new Logger(NotificationBackClient.name);
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = this.config.get<string>('externalServices.notificationApiUrl') ?? '';
  }

  async notifyService(params: {
    serviceId: string;
    title: string;
    message: string;
    type: string;
    source: string;
    data?: Record<string, unknown>;
  }): Promise<void> {
    if (!this.baseUrl) {
      this.logger.warn('NOTIFICATION_API_URL non configuré, notification temps réel ignorée');
      return;
    }
    try {
      await firstValueFrom(this.http.post(`${this.baseUrl}/notifications/service`, params));
    } catch (err) {
      this.logger.error(`Erreur envoi notification temps réel: ${(err as Error).message}`);
    }
  }
}
