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

  // `serviceOrigineName` est purement décoratif (libellé du destinataire dans le message) : seul
  // `serviceOrigineId` sert réellement à router la notification. Il était pourtant exigé par
  // chaque appelant, alors que le nom provient d'une résolution best-effort auprès du registre
  // central (ServiceRegistryClient renvoie null si le registre est injoignable, non configuré, ou
  // si le service demandeur y est inconnu — cas de tout nouveau service du CHU). Résultat : dès
  // que le nom manquait, le service demandeur n'était JAMAIS averti du RDV planifié, d'une CPA
  // refusée, d'une date d'opération modifiée ni du retour de son patient. Il est désormais
  // optionnel, avec repli sur l'identifiant.
  async notifyOriginService(params: {
    patientId: string;
    type: string;
    serviceOrigineId: string;
    serviceOrigineName?: string | null;
    payload: any;
    notificationUrl?: string;
  }): Promise<void> {
    const {
      patientId,
      type,
      serviceOrigineId,
      payload,
      notificationUrl,
    } = params;
    const serviceOrigineName = params.serviceOrigineName || serviceOrigineId;

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
