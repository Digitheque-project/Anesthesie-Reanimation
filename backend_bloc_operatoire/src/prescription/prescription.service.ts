import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Interval } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
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
} from '../external/prescription-externe.client';
import { NotificationBackClient } from '../external/notification-back.client';

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
    // inefficace et créait une nouvelle notification à chaque cycle de 15s. On refuse aussi de
    // ré-ingérer si ce patient a déjà une notification de prescription encore en attente.
    const notificationDejaEnAttente = await this.notificationRepo.findOne({
      where: {
        patientId: p.patientId,
        statut: StatutNotificationCPA.EN_ATTENTE,
      },
    });
    if (notificationDejaEnAttente) return;

    const acte = p.actes?.[0];
    const niveauUrgence = this.mapUrgence(p.urgence);

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
      dateIntervention: p.dateIntervention
        ? new Date(p.dateIntervention)
        : undefined,
      alertes: p.alertes || undefined,
      prescripteurId: p.prescripteurId,
      chirurgien_nom: p.chirurgien || undefined,
      statut: PatientStatut.EN_ATTENTE_CPA,
      niveauUrgence,
      serviceOrigineId: p.serviceIdSource || undefined,
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
        dateIntervention: p.dateIntervention
          ? new Date(p.dateIntervention)
          : undefined,
        patientId: p.patientId,
        intervention: acte?.libelle || 'Intervention',
        chirurgienId: undefined,
        chirurgienNom: p.chirurgien || undefined,
        professeurCPA: undefined,
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
