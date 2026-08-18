import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { In, Repository } from 'typeorm';
import { WebhookNotification } from '../entities/webhook-notification.entity';
import { PatientBloc, PatientStatut } from '../entities/patient-bloc.entity';
import {
  NotificationCPA,
  StatutNotificationCPA,
} from '../entities/notification-cpa.entity';
import { CanalIngestion } from '../entities/ingestion-externe.entity';
import { IngestionLedgerService } from '../ingestion/ingestion-ledger.service';
import { ServiceRegistryClient } from '../external/service-registry.client';
import { NotificationBackClient } from '../external/notification-back.client';
import { niveauDepuisLibelle, estNiveauUrgent } from '../common/urgence';
import { construireIdDossier } from '../common/id-dossier';

// Vocabulaire des notifications que le Bloc ÉMET lui-même vers les services demandeurs (voir
// NotificationOutgoingService et DemandeCpaExterneService.notifierResultat). Un service qui nous
// répond, ou une de nos propres notifications qui nous reviendrait, ne doit évidemment pas faire
// entrer un patient au bloc.
const TYPES_SORTANTS = new Set([
  'CPA_APTE',
  'CPA_INAPTE',
  'CPA_REPORT',
  'CPA_RESULTAT',
  'VPA_REALISEE',
  'RDV_CPA_PLANIFIE',
  'RETOUR_SERVICE_ORIGINE',
  'DATE_OPERATION_MODIFIEE',
  'demande_cpa_resultat',
  'demande_vpa_resultat',
  'patient_statut_change',
]);

@Injectable()
export class WebhookNotificationService {
  private readonly logger = new Logger(WebhookNotificationService.name);
  private readonly blocServiceId: string;

  constructor(
    @InjectRepository(WebhookNotification)
    private readonly webhookRepo: Repository<WebhookNotification>,
    @InjectRepository(PatientBloc)
    private readonly patientBlocRepo: Repository<PatientBloc>,
    @InjectRepository(NotificationCPA)
    private readonly notificationRepo: Repository<NotificationCPA>,
    private readonly ingestionLedger: IngestionLedgerService,
    private readonly serviceRegistryClient: ServiceRegistryClient,
    private readonly notificationBackClient: NotificationBackClient,
    private readonly config: ConfigService,
  ) {
    this.blocServiceId =
      this.config.get<string>('externalServices.serviceId') ?? '';
  }

  async processIncomingNotification(
    payload: any,
    sourceService?: string,
  ): Promise<boolean> {
    this.logger.log(`📦 Webhook reçu: ${JSON.stringify(payload)}`);

    let notification: WebhookNotification;
    try {
      notification = this.webhookRepo.create({
        type: payload.type,
        motif: payload.motif || payload.message,
        patientId: payload.patientId || payload.targetId,
        sourceServiceId: payload.sourceServiceId || payload.emitter,
        sourceServiceName:
          payload.sourceServiceName || payload.emitterName || sourceService,
        targetServiceId: payload.targetServiceId || payload.recipient,
        targetServiceName: payload.targetServiceName || payload.recipientName,
        urgence: payload.urgence,
        payload: payload.payload ?? payload,
        channels: payload.channels,
        processed: false,
      });

      await this.webhookRepo.save(notification);
      this.logger.log(`✅ Notification stockée (ID: ${notification.id})`);
    } catch (error) {
      this.logger.error(`❌ Erreur: ${error.message}`);
      return true;
    }

    // C'est ici que se jouait le point bloquant de ce canal : la notification était STOCKÉE et
    // rien d'autre. Aucun PatientBloc, aucune NotificationCPA. Conséquence pour tout service qui
    // s'adresse au bloc par cette porte (celle documentée comme générique, donc la porte
    // naturelle d'un service qui n'émet ni prescription bloc ni prescription imagerie) :
    //  - le patient n'apparaissait dans AUCUNE liste du bloc (fil de travail, patients du jour,
    //    programme, planning) — toutes bâties sur `patients_bloc` ;
    //  - "Voir le dossier" depuis la cloche tombait sur "Patient introuvable" ;
    //  - la ligne, dépourvue de `statut`, était même masquée par le filtre "En attente" du fil de
    //    prescription, qui est son filtre par défaut.
    // Le patient était donc, en pratique, impossible à prendre en charge.
    await this.admettrePatient(payload, notification).catch((err) =>
      this.logger.error(
        `❌ Échec admission depuis le webhook ${notification.id}: ${(err as Error).message}`,
      ),
    );

    return true;
  }

  // Fait entrer le patient dans le circuit du bloc, avec les mêmes garde-fous que les autres
  // canaux d'arrivée (PrescriptionService.ingerer, PrescriptionImagerieListenerService.ingerer,
  // DemandeCpaExterneService.receive) : jamais de doublon pour une référence déjà ingérée, jamais
  // de réouverture d'un épisode en cours.
  private async admettrePatient(
    payload: any,
    notification: WebhookNotification,
  ): Promise<void> {
    const patientId = notification.patientId;
    if (!patientId) return;

    const type = String(payload?.type ?? '');
    if (TYPES_SORTANTS.has(type)) return;
    // Nos propres évènements re-diffusés par le service Notification.
    if (
      String(payload?.source ?? '').toLowerCase() === 'bloc-operatoire' ||
      (this.blocServiceId && payload?.emitter === this.blocServiceId)
    ) {
      return;
    }

    const reference =
      payload?.referenceId ??
      payload?.entiteRefId ??
      payload?.sourceReferenceId ??
      payload?.id ??
      null;
    if (
      await this.ingestionLedger.dejaIngeree(
        CanalIngestion.WEBHOOK_SERVICE,
        reference,
      )
    ) {
      return;
    }

    // Un patient déjà pris en charge (notification ouverte ou épisode engagé) n'est pas
    // ré-admis : la notification webhook reste consultable, mais elle ne relance pas le parcours.
    const episodeEngage: PatientStatut[] = [
      PatientStatut.CPA_REALISE,
      PatientStatut.EN_ATTENTE_VERIFICATION_VEILLE,
      PatientStatut.VERIFICATION_VEILLE_REALISEE,
      PatientStatut.PRET_POUR_BLOC,
      PatientStatut.EN_COURS_OPERATION,
      PatientStatut.EN_SALLE_REVEIL,
    ];
    const [patient, notificationDejaOuverte] = await Promise.all([
      this.patientBlocRepo.findOne({ where: { patientId } }),
      this.notificationRepo.findOne({
        where: {
          patientId,
          statut: In([
            StatutNotificationCPA.EN_ATTENTE,
            StatutNotificationCPA.RDV_PLANIFIE,
          ]),
        },
      }),
    ]);
    if (
      notificationDejaOuverte ||
      (patient && episodeEngage.includes(patient.statut))
    ) {
      return;
    }

    // `urgence` arrive soit en échelle numérique (1-5, convention des demandes de CPA), soit en
    // libellé ('URGENT', 'STAT'...) selon le service émetteur — les deux sont acceptés.
    const niveauUrgence = niveauDepuisLibelle(
      payload?.urgence ?? payload?.payload?.urgence,
    );
    const serviceSourceId = notification.sourceServiceId || null;
    const serviceSourceNom =
      (await this.serviceRegistryClient.getServiceName(serviceSourceId)) ||
      notification.sourceServiceName ||
      null;
    const libelle =
      payload?.intervention ||
      payload?.motif ||
      payload?.message ||
      notification.motif ||
      'Prise en charge demandée';

    const donnees = {
      patientId,
      chuId:
        payload?.chuId ||
        patient?.chuId ||
        this.config.get<string>('externalServices.chuId'),
      idDossier: patient?.idDossier || construireIdDossier(patientId),
      groupeSanguin: patient?.groupeSanguin || 'INCONNU',
      libelle: String(libelle).slice(0, 255),
      statut: PatientStatut.EN_ATTENTE_CPA,
      niveauUrgence,
      serviceOrigineId: serviceSourceId ?? undefined,
      serviceOrigine: serviceSourceNom ?? undefined,
    };

    if (patient) {
      Object.assign(patient, donnees);
      await this.patientBlocRepo.save(patient);
    } else {
      await this.patientBlocRepo.save(this.patientBlocRepo.create(donnees));
    }

    const notif = await this.notificationRepo.save(
      this.notificationRepo.create({
        heurePrescription: new Date().toTimeString().substring(0, 5),
        patientId,
        intervention: String(libelle).slice(0, 255),
        serviceSourceId: serviceSourceId ?? undefined,
        serviceSourceNom: serviceSourceNom ?? undefined,
        estUrgent: estNiveauUrgent(niveauUrgence),
        niveauUrgence,
        statut: StatutNotificationCPA.EN_ATTENTE,
      }),
    );

    // La ligne webhook brute a rempli son office : la notification CPA la remplace dans le fil et
    // dans la cloche. La laisser à `processed: false` la ferait compter une seconde fois (voir
    // NotificationCPAService.getUnreadCount, qui additionne les deux sources).
    notification.processed = true;
    await this.webhookRepo.save(notification);

    await this.ingestionLedger.marquerIngeree({
      canal: CanalIngestion.WEBHOOK_SERVICE,
      referenceExterne: reference,
      patientId,
      serviceSourceId,
      libelle: String(libelle),
    });

    this.logger.log(
      `📋 Patient ${patientId} admis au bloc depuis le webhook générique (${serviceSourceNom || serviceSourceId || 'service inconnu'})`,
    );

    // Même alerte temps réel que les autres canaux : sans elle, cette arrivée restait muette
    // jusqu'au prochain rafraîchissement périodique de la cloche.
    await this.notificationBackClient.notifyService({
      serviceId: this.blocServiceId,
      title: estNiveauUrgent(niveauUrgence)
        ? '🔴 Demande de prise en charge urgente reçue'
        : '📋 Nouvelle demande de prise en charge reçue',
      message: `${libelle} — patient ${patientId}`,
      type: 'new_prescription',
      source: 'bloc-operatoire',
      data: {
        patientId,
        notificationId: notif.id,
        urgence: payload?.urgence,
      },
    });
  }
}
