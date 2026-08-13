import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Interval } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { In, Repository } from 'typeorm';
import { ReceivePrescriptionDto } from './dto/receive-prescription.dto';
import {
  PatientBloc,
  PatientStatut,
  NiveauUrgence,
} from '../entities/patient-bloc.entity';
import {
  NotificationCPA,
  StatutNotificationCPA,
} from '../entities/notification-cpa.entity';
import {
  PrescriptionExterneClient,
  PrescriptionBlocExterne,
  ActeBlocExterne,
} from '../external/prescription-externe.client';
import { NotificationBackClient } from '../external/notification-back.client';
import { ServiceRegistryClient } from '../external/service-registry.client';

@Injectable()
export class PrescriptionService {
  private readonly logger = new Logger(PrescriptionService.name);
  private polling = false;

  constructor(
    @InjectRepository(PatientBloc)
    private patientBlocRepo: Repository<PatientBloc>,
    @InjectRepository(NotificationCPA)
    private notificationRepo: Repository<NotificationCPA>,
    private prescriptionClient: PrescriptionExterneClient,
    private notificationBackClient: NotificationBackClient,
    private serviceRegistryClient: ServiceRegistryClient,
    private config: ConfigService,
  ) {}

  // Webhook conservé pour compatibilité, mais dans l'architecture réelle le service
  // Prescriptions ne l'appelle jamais directement : il avertit le service Notification, qui
  // nous pousse l'évènement en WebSocket (voir PrescriptionImagerieListenerService, qui
  // déclenche pollPrescriptionsBloc() dès réception). Si ce webhook est un jour appelé, il
  // déclenche la même synchronisation immédiate, sans reconstruire la fiche patient depuis son
  // payload (sa forme générique couvre tous les types de prescriptions de l'hôpital, pas
  // seulement le bloc opératoire) — on va chercher et ingère les prescriptions de bloc via le
  // contrat dédié (getPrescriptionsBloc), déjà fiable et dédoublonné.
  async processPrescription(dto: ReceivePrescriptionDto): Promise<boolean> {
    this.logger.log(
      `📦 Notification de prescription reçue (type ${dto.type}, patient ${dto.patientId}) — synchronisation immédiate`,
    );
    this.pollPrescriptionsBloc().catch((err) =>
      this.logger.error(
        `Erreur lors de la synchronisation déclenchée par webhook: ${(err as Error).message}`,
      ),
    );
    return true;
  }

  // Poll le service central "Prescriptions" pour récupérer les prescriptions de bloc
  // destinées à ce service, et les ingère dans le fil de prescription local.
  @Interval(15000)
  async pollPrescriptionsBloc(): Promise<void> {
    if (this.polling) return; // évite le chevauchement si un cycle précédent traîne
    const serviceId = this.config.get<string>('externalServices.serviceId');
    if (!serviceId) return;

    this.polling = true;
    try {
      const prescriptions =
        await this.prescriptionClient.getPrescriptionsBloc(serviceId);
      for (const p of prescriptions) {
        try {
          await this.ingerer(p, serviceId);
        } catch (err) {
          this.logger.error(
            `Erreur ingestion prescription ${p.id}: ${(err as Error).message}`,
          );
        }
      }
    } finally {
      this.polling = false;
    }
  }

  private mapUrgence(urgence: string): NiveauUrgence {
    // Le service Prescription (bloc) envoie 'TRES_URGENT'/'URGENT'/'NORMAL' — 'STAT'/'URGENTE'
    // conservés en compatibilité avec d'anciens payloads ou d'autres sources.
    const u = (urgence || '').toUpperCase();
    if (u === 'TRES_URGENT' || u === 'STAT') return NiveauUrgence.TRES_URGENT;
    if (u === 'URGENT' || u === 'URGENTE') return NiveauUrgence.URGENT;
    return NiveauUrgence.NORMAL;
  }

  private extraireDateIntervention(acte?: ActeBlocExterne): Date | undefined {
    // La date et l'heure prévues de l'opération sont fixées par le chirurgien sur l'acte
    // (Planification et Logistique) — le service Prescriptions les renvoie dans ActeBloc, pas à
    // la racine de la prescription. La date porte minuit UTC ; on y injecte l'heure "11:05" pour
    // ne pas stocker une date à 00h00 qui ne reflétait ni la date ni l'heure réelles.
    if (!acte?.dateIntervention) return undefined;
    const base = new Date(acte.dateIntervention);
    const heure = acte.heureIntervention;
    const [h, m] = (heure || '').split(':').map(Number);
    if (isNaN(h)) return base;
    return new Date(
      Date.UTC(
        base.getUTCFullYear(),
        base.getUTCMonth(),
        base.getUTCDate(),
        h,
        isNaN(m) ? 0 : m,
        0,
        0,
      ),
    );
  }

  private async ingerer(
    p: PrescriptionBlocExterne,
    serviceId: string,
  ): Promise<void> {
    const dejaIngeree = await this.patientBlocRepo.findOne({
      where: { prescriptionExterneId: p.id },
    });
    if (dejaIngeree) return;

    // Filet de sécurité complémentaire : le service Prescriptions externe peut renvoyer un `id`
    // différent à chaque interrogation pour ce qui est conceptuellement la même prescription
    // (ex: source de test sans persistance), ce qui rend le dédoublonnage ci-dessus par `p.id`
    // inefficace et créait une nouvelle notification à chaque cycle de 15s. Filet anti-ré-ingestion
    // étendu au RDV planifié : une fois le RDV CPA planifié, la notification interne passe
    // d'EN_ATTENTE à RDV_PLANIFIE — le seul garde-fou EN_ATTENTE ne bloquait donc plus rien, et le
    // patient était ré-ingéré comme une NOUVELLE prescription (nouveau son + ligne webhook +
    // réapparition dans la cloche et le fil) juste après la planification. On bloque tant qu'une
    // prescription reste ouverte pour ce patient (EN_ATTENTE ou RDV_PLANIFIE) ; seul un épisode
    // terminé (notification REALISE) laisse passer un nouveau séjour.
    const notificationDejaOuverte = await this.notificationRepo.findOne({
      where: {
        patientId: p.patientId,
        statut: In([
          StatutNotificationCPA.EN_ATTENTE,
          StatutNotificationCPA.RDV_PLANIFIE,
        ]),
      },
    });
    if (notificationDejaOuverte) return;

    // Un patient déjà passé par le bloc (statut SORTI, CPA_REALISE, EN_COURS_OPERATION...) peut
    // revenir pour une NOUVELLE prise en charge : cette nouvelle prescription est un nouveau
    // séjour, pas une ré-ingestion de l'ancien. Le dédoublonnage se fait plus haut par
    // `prescriptionExterneId` (même prescription) et par `notificationDejaEnAttente` (même
    // patient déjà en attente) ; ici on laisse passer, et la fiche PatientBloc est re-basculée
    // en EN_ATTENTE_CPA ci-dessous (Object.assign + statut) pour ce nouvel épisode.
    const acte = p.actes?.[0] ?? p.ActeBloc?.[0];
    const niveauUrgence = this.mapUrgence(p.urgence);
    const dateIntervention = this.extraireDateIntervention(acte);
    // Le service Prescriptions ne transmet que l'id du service demandeur, jamais son nom — sans
    // cette résolution, "service source" restait vide partout où ce patient est affiché (fiche
    // patient, prescription au sein de la CPA, notification).
    const serviceSourceNom = await this.serviceRegistryClient.getServiceName(
      p.serviceIdSource,
    );

    let patient = await this.patientBlocRepo.findOne({
      where: { patientId: p.patientId },
    });
    const donneesPatient = {
      patientId: p.patientId,
      chuId: p.chuId,
      idDossier: patient?.idDossier || p.patientId,
      groupeSanguin: patient?.groupeSanguin || 'INCONNU',
      libelle: acte?.libelle || undefined,
      risqueHemorragique: acte?.risqueHemorragique || undefined,
      typeChirurgie: acte?.typeChirurgie || undefined,
      consignes: p.consignes || undefined,
      dateIntervention,
      alertes: p.alertes || undefined,
      prescripteurId: p.prescripteurId,
      chirurgien_nom: (acte?.nomChirurgien ?? p.chirurgien) || undefined,
      statut: PatientStatut.EN_ATTENTE_CPA,
      niveauUrgence,
      serviceOrigineId: p.serviceIdSource || undefined,
      serviceOrigine: serviceSourceNom || undefined,
      prescriptionExterneId: p.id,
    };

    if (patient) {
      Object.assign(patient, donneesPatient);
      await this.patientBlocRepo.save(patient);
    } else {
      patient = await this.patientBlocRepo.save(
        this.patientBlocRepo.create(donneesPatient),
      );
    }

    const notif = await this.notificationRepo.save(
      this.notificationRepo.create({
        heurePrescription: new Date().toTimeString().substring(0, 5),
        dateIntervention,
        patientId: p.patientId,
        intervention: acte?.libelle || 'Intervention',
        chirurgienId: undefined,
        chirurgienNom: (acte?.nomChirurgien ?? p.chirurgien) || undefined,
        professeurCPA: undefined,
        serviceSourceId: p.serviceIdSource || undefined,
        serviceSourceNom: serviceSourceNom || undefined,
        estUrgent: niveauUrgence !== NiveauUrgence.NORMAL,
        statut: StatutNotificationCPA.EN_ATTENTE,
      }),
    );

    this.logger.log(
      `📋 Nouvelle prescription bloc ingérée pour patient ${p.patientId} (${acte?.libelle || 'intervention'})`,
    );

    await this.prescriptionClient.updateStatut(p.id, 'RECU_BLOC');

    await this.notificationBackClient.notifyService({
      serviceId,
      title:
        niveauUrgence !== NiveauUrgence.NORMAL
          ? '🔴 Prescription urgente reçue'
          : '📋 Nouvelle prescription reçue',
      message: `${acte?.libelle || 'Intervention'} — patient ${p.patientId}`,
      type: 'new_prescription',
      source: 'bloc-operatoire',
      data: {
        patientId: p.patientId,
        notificationId: notif.id,
        urgence: p.urgence,
      },
    });
  }
}
