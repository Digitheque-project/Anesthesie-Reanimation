import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NotificationOutgoingService {
  private readonly logger = new Logger(NotificationOutgoingService.name);
  private readonly blocServiceId: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.blocServiceId =
      this.config.get<string>('externalServices.serviceId') ?? '';
  }

  async notifyOriginService(params: {
    patientId: string;
    type: string;
    serviceOrigineId: string;
    serviceOrigineName: string;
    payload: any;
    notificationUrl?: string;
  }): Promise<void> {
    const {
      patientId,
      type,
      serviceOrigineId,
      serviceOrigineName,
      payload,
      notificationUrl,
    } = params;

    const url =
      notificationUrl ||
      this.config.get<string>('externalServices.notificationOrigineUrl');
    if (!url) {
      this.logger.warn(
        `URL de notification origine non configurée, notification "${type}" pour patient ${patientId} ignorée`,
      );
      return;
    }

    try {
      await firstValueFrom(
        this.http.post(`${url}/notifications/receive`, {
          type,
          motif: `Statut CPA/VPA pour patient ${patientId}`,
          patientId,
          emitter: this.blocServiceId,
          emitterName: 'Bloc Opératoire',
          recipient: serviceOrigineId,
          recipientName: serviceOrigineName,
          payload,
          createdAt: new Date().toISOString(),
        }),
      );
      this.logger.log(
        `Notification "${type}" envoyée au service ${serviceOrigineName} pour patient ${patientId}`,
      );
    } catch (err) {
      this.logger.error(
        `Échec envoi notification "${type}" au service ${serviceOrigineName}: ${(err as Error).message}`,
      );
    }
  }
}
