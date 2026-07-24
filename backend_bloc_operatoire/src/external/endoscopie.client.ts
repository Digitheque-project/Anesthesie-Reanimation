import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { DemandeCpaExterne } from '../entities/demande-cpa-externe.entity';

@Injectable()
export class EndoscopieClient {
  private readonly logger = new Logger(EndoscopieClient.name);
  private readonly baseUrl: string;
  private readonly serviceId: string;
  private readonly blocServiceId: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl =
      this.config.get<string>('externalServices.endoscopieApiUrl') ?? '';
    this.serviceId =
      this.config.get<string>('externalServices.endoscopieServiceId') ?? '';
    this.blocServiceId =
      this.config.get<string>('externalServices.serviceId') ?? '';
  }

  private async notify(
    demande: DemandeCpaExterne,
    type: string,
    payload: any,
  ): Promise<void> {
    if (!this.baseUrl) {
      this.logger.warn(
        'ENDOSCOPIE_API_URL non configuré, notification sortante ignorée',
      );
      return;
    }
    try {
      await firstValueFrom(
        this.http.post(`${this.baseUrl}/notifications/receive`, {
          type,
          motif: `Résultat demande CPA/VPA pour patient ${demande.patientId}`,
          patientId: demande.patientId,
          entiteRefType: demande.sourceReferenceType,
          entiteRefId: demande.sourceReferenceId,
          emitter: this.blocServiceId,
          emitterName: 'Bloc Opératoire',
          recipient: demande.sourceServiceId || this.serviceId,
          recipientName: demande.sourceServiceName || 'Endoscopie',
          payload,
          createdAt: new Date().toISOString(),
        }),
      );
      this.logger.log(
        `✅ Notification "${type}" envoyée à Endoscopie pour patient ${demande.patientId}`,
      );
    } catch (err) {
      this.logger.error(
        `❌ Échec envoi notification "${type}" à Endoscopie: ${(err as Error).message}`,
      );
    }
  }

  async notifyCpaResultat(
    demande: DemandeCpaExterne,
    decision: string,
    details: { dateCpa?: Date; observations?: string },
  ): Promise<void> {
    await this.notify(demande, 'CPA_RESULTAT', { decision, ...details });
  }

  async notifyVpaRealisee(
    demande: DemandeCpaExterne,
    details: { dateVpa?: Date },
  ): Promise<void> {
    await this.notify(demande, 'VPA_REALISEE', details);
  }
}
