import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { io, Socket } from 'socket.io-client';
import { NotificationCPA, StatutNotificationCPA } from '../entities/notification-cpa.entity';
import { PrescriptionImagerieClient, PrescriptionImagerieExterne } from '../external/prescription-imagerie.client';
import { PrescriptionService } from '../prescription/prescription.service';

// Ni le service Prescription (bloc), ni le service Prescription (imagerie) ne nous poussent
// jamais la donnée directement : ils créent une prescription puis avertissent le service
// Notification (POST /notifications/service), qui la diffuse en temps réel par WebSocket à
// tous les postes connectés du service ciblé — exactement comme le frontend s'y connecte déjà
// (voir blocope-front/lib/notifications/socket.ts). Ce service reproduit la même connexion
// côté backend, sur une seule et même socket pour les deux sources :
//  - Prescription imagerie : on va chercher le contenu par GET (le "push" ne sert qu'à savoir
//    QUAND regarder, jamais à transporter la donnée elle-même).
//  - Prescription bloc : on déclenche immédiatement un cycle de PrescriptionService.pollPrescriptionsBloc()
//    (au lieu d'attendre jusqu'à son prochain cycle périodique) — ce service n'a pas d'endpoint
//    GET "par patient", seulement "toutes les prescriptions en attente pour nous", donc pas de
//    ciblage plus précis possible ici. Le webhook POST /prescription/receive existe toujours
//    mais n'est jamais appelé par le vrai service Prescription — c'est ce canal (Notification)
//    qui est réellement utilisé.
@Injectable()
export class PrescriptionImagerieListenerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrescriptionImagerieListenerService.name);
  private socket: Socket | null = null;
  private readonly serviceId: string;

  constructor(
    private readonly config: ConfigService,
    private readonly prescriptionImagerieClient: PrescriptionImagerieClient,
    private readonly prescriptionService: PrescriptionService,
    @InjectRepository(NotificationCPA) private readonly notificationRepo: Repository<NotificationCPA>,
  ) {
    this.serviceId = this.config.get<string>('externalServices.serviceId') ?? '';
  }

  onModuleInit() {
    const notificationUrl = this.config.get<string>('externalServices.notificationApiUrl');
    if (!notificationUrl || !this.serviceId) {
      this.logger.warn('NOTIFICATION_API_URL ou SERVICE_ID manquant — écoute temps réel des prescriptions désactivée');
      return;
    }

    this.socket = io(`${notificationUrl}/notifications`, {
      query: { serviceId: this.serviceId },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 3000,
    });

    this.socket.on('connect', () => {
      this.logger.log(`Connecté au service Notification (temps réel) en tant que service ${this.serviceId}`);
    });

    this.socket.on('disconnect', (reason) => {
      this.logger.warn(`Déconnecté du service Notification : ${reason}`);
    });

    this.socket.on('connect_error', (err) => {
      this.logger.error(`Erreur de connexion au service Notification : ${err.message}`);
    });

    this.socket.on('notification', (notif: any) => this.traiterNotification(notif));
  }

  onModuleDestroy() {
    this.socket?.disconnect();
    this.socket = null;
  }

  private estNotificationPrescription(notif: any): boolean {
    const type = String(notif?.type || '').toLowerCase();
    const source = String(notif?.source || '').toLowerCase();
    return Boolean(notif?.data?.patientId) && (type.includes('prescription') || source.includes('prescription'));
  }

  private async traiterNotification(notif: any): Promise<void> {
    if (!this.estNotificationPrescription(notif)) return;
    const patientId = String(notif.data.patientId);
    this.logger.log(`📬 Notification de prescription reçue pour le patient ${patientId}`);

    // Déclenché à chaque notification de prescription, imagerie ou bloc — sans distinction
    // fiable possible entre les deux sources (même vocabulaire type/source), mais sans risque :
    // le poll est dédoublonné et un cycle de plus ne coûte qu'un appel GET.
    this.prescriptionService.pollPrescriptionsBloc().catch((err) =>
      this.logger.error(`Erreur lors du poll bloc déclenché par notification: ${(err as Error).message}`),
    );

    try {
      // Le ciblage réel se fait déjà au niveau de la notification elle-même (le service
      // Notification ne nous livre que les évènements adressés à notre serviceId) ;
      // `serviceIdDest` sur la prescription est un signal applicatif complémentaire mais pas
      // toujours renseigné côté service Prescription — on ne l'utilise que pour exclure les
      // lignes explicitement destinées à un AUTRE service, jamais pour tout rejeter.
      const prescriptions = await this.prescriptionImagerieClient.getParPatient(patientId);
      const nousConcernant = prescriptions.filter((p) => !p.serviceIdDest || p.serviceIdDest === this.serviceId);
      for (const prescription of nousConcernant) {
        await this.ingerer(prescription);
      }
    } catch (err) {
      this.logger.error(`Erreur ingestion prescription imagerie pour ${patientId}: ${(err as Error).message}`);
    }
  }

  private async ingerer(prescription: PrescriptionImagerieExterne): Promise<void> {
    // Même filet anti-doublon que l'ingestion des prescriptions bloc (prescription.service.ts) :
    // une notification encore EN_ATTENTE pour ce patient suffit, pas besoin de suivre l'ID
    // externe précisément.
    const dejaEnAttente = await this.notificationRepo.findOne({
      where: { patientId: prescription.patientId, statut: StatutNotificationCPA.EN_ATTENTE },
    });
    if (dejaEnAttente) return;

    const urgence = (prescription.urgence || '').toUpperCase();
    const estUrgent = urgence !== '' && !urgence.startsWith('NORMAL');
    const prescripteurNom = [prescription.prescripteurPrenomManuel, prescription.prescripteurNomManuel]
      .filter(Boolean)
      .join(' ')
      .trim();

    await this.notificationRepo.save(
      this.notificationRepo.create({
        heurePrescription: new Date().toTimeString().substring(0, 5),
        patientId: prescription.patientId,
        intervention: prescription.type || 'Prescription imagerie',
        chirurgienNom: prescripteurNom || undefined,
        estUrgent,
        statut: StatutNotificationCPA.EN_ATTENTE,
      }),
    );

    this.logger.log(`📋 Prescription imagerie ingérée pour le patient ${prescription.patientId} (${prescription.type || 'examen'})`);
  }
}
