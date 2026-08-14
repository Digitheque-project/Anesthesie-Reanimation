import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { io, Socket } from 'socket.io-client';
import {
  NotificationCPA,
  StatutNotificationCPA,
} from '../entities/notification-cpa.entity';
import { PatientBloc, PatientStatut } from '../entities/patient-bloc.entity';
import { CreneauBloc, StatutCreneau } from '../entities/creneau-bloc.entity';
import {
  PrescriptionImagerieClient,
  PrescriptionImagerieExterne,
} from '../external/prescription-imagerie.client';
import { PrescriptionService } from '../prescription/prescription.service';
import { ServiceRegistryClient } from '../external/service-registry.client';
import { NotificationBackClient } from '../external/notification-back.client';
import { IngestionLedgerService } from '../ingestion/ingestion-ledger.service';
import { CanalIngestion } from '../entities/ingestion-externe.entity';
import { niveauDepuisLibelle, estNiveauUrgent } from '../common/urgence';
import { construireIdDossier } from '../common/id-dossier';

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
export class PrescriptionImagerieListenerService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(
    PrescriptionImagerieListenerService.name,
  );
  private socket: Socket | null = null;
  private readonly serviceId: string;

  constructor(
    private readonly config: ConfigService,
    private readonly prescriptionImagerieClient: PrescriptionImagerieClient,
    private readonly prescriptionService: PrescriptionService,
    private readonly serviceRegistryClient: ServiceRegistryClient,
    private readonly notificationBackClient: NotificationBackClient,
    private readonly ingestionLedger: IngestionLedgerService,
    @InjectRepository(NotificationCPA)
    private readonly notificationRepo: Repository<NotificationCPA>,
    @InjectRepository(PatientBloc)
    private readonly patientBlocRepo: Repository<PatientBloc>,
    @InjectRepository(CreneauBloc)
    private readonly creneauRepo: Repository<CreneauBloc>,
  ) {
    this.serviceId =
      this.config.get<string>('externalServices.serviceId') ?? '';
  }

  onModuleInit() {
    const notificationUrl = this.config.get<string>(
      'externalServices.notificationApiUrl',
    );
    if (!notificationUrl || !this.serviceId) {
      this.logger.warn(
        'NOTIFICATION_API_URL ou SERVICE_ID manquant — écoute temps réel des prescriptions désactivée',
      );
      return;
    }

    this.socket = io(`${notificationUrl}/notifications`, {
      query: { serviceId: this.serviceId },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 3000,
    });

    this.socket.on('connect', () => {
      this.logger.log(
        `Connecté au service Notification (temps réel) en tant que service ${this.serviceId}`,
      );
    });

    this.socket.on('disconnect', (reason) => {
      this.logger.warn(`Déconnecté du service Notification : ${reason}`);
    });

    this.socket.on('connect_error', (err) => {
      this.logger.error(
        `Erreur de connexion au service Notification : ${err.message}`,
      );
    });

    this.socket.on('notification', (notif: any) =>
      this.traiterNotification(notif),
    );
  }

  onModuleDestroy() {
    this.socket?.disconnect();
    this.socket = null;
  }

  private estNotificationPrescription(notif: any): boolean {
    const type = String(notif?.type || '').toLowerCase();
    const source = String(notif?.source || '').toLowerCase();
    return (
      Boolean(notif?.data?.patientId) &&
      (type.includes('prescription') || source.includes('prescription'))
    );
  }

  private async traiterNotification(notif: any): Promise<void> {
    if (!this.estNotificationPrescription(notif)) return;
    // Ignore nos propres ré-émissions : après ingestion, PrescriptionService.ingerer /
    // la partie imagerie repoussent un évènement `new_prescription` (source "bloc-operatoire"),
    // que le service Notification re-diffuse à tous les abonnés du service — y compris ce
    // listener. Sans cette garde, chaque ingestion déclenchait un nouveau poll + un GET imagerie
    // (boucle de rétroaction qui multipliait la charge et les évènements). Les évènements des
    // vrais services prescripteurs arrivent, eux, sous une autre source.
    if (String(notif?.source || '').toLowerCase() === 'bloc-operatoire') return;
    const patientId = String(notif.data.patientId);
    this.logger.log(
      `📬 Notification de prescription reçue pour le patient ${patientId}`,
    );

    // Déclenché à chaque notification de prescription, imagerie ou bloc — sans distinction
    // fiable possible entre les deux sources (même vocabulaire type/source), mais sans risque :
    // le poll est dédoublonné et un cycle de plus ne coûte qu'un appel GET.
    this.prescriptionService
      .pollPrescriptionsBloc()
      .catch((err) =>
        this.logger.error(
          `Erreur lors du poll bloc déclenché par notification: ${(err as Error).message}`,
        ),
      );

    try {
      // Le ciblage réel se fait déjà au niveau de la notification elle-même (le service
      // Notification ne nous livre que les évènements adressés à notre serviceId) ;
      // `serviceIdDest` sur la prescription est un signal applicatif complémentaire mais pas
      // toujours renseigné côté service Prescription — on ne l'utilise que pour exclure les
      // lignes explicitement destinées à un AUTRE service, jamais pour tout rejeter.
      const prescriptions =
        await this.prescriptionImagerieClient.getParPatient(patientId);
      const nousConcernant = prescriptions.filter(
        (p) => !p.serviceIdDest || p.serviceIdDest === this.serviceId,
      );
      for (const prescription of nousConcernant) {
        await this.ingerer(prescription);
      }
    } catch (err) {
      this.logger.error(
        `Erreur ingestion prescription imagerie pour ${patientId}: ${(err as Error).message}`,
      );
    }
  }

  private async ingerer(
    prescription: PrescriptionImagerieExterne,
  ): Promise<void> {
    // Aucune trace de ce qui avait déjà été ingéré n'existait pour ce canal (contrairement aux
    // prescriptions bloc, qui posaient au moins `PatientBloc.prescriptionExterneId`) : la seule
    // protection était l'état courant du patient. Dès que son épisode était clos (SORTI /
    // CPA_INAPTE), la MÊME prescription imagerie re-poussée par le service source était
    // ré-ingérée comme une nouvelle arrivée — nouvelle notification, nouveau carillon, patient
    // rebasculé en EN_ATTENTE_CPA.
    if (
      await this.ingestionLedger.dejaIngeree(
        CanalIngestion.PRESCRIPTION_IMAGERIE,
        prescription.id,
      )
    ) {
      return;
    }
    // Même filet anti-doublon que l'ingestion des prescriptions bloc (prescription.service.ts),
    // étendu au RDV planifié : une prescription reste "ouverte" tant que sa notification est
    // EN_ATTENTE ou RDV_PLANIFIE. Sans ce second statut, une fois le RDV CPA planifié la même
    // prescription re-poussée par le service était ré-ingérée comme une nouvelle (son + retour
    // dans la cloche et le fil) — voir le commentaire détaillé côté PrescriptionService.ingerer.
    // Comme pour le bloc, on bloque tant que le patient est déjà PRIS EN CHARGE : notification
    // ouverte, créneau déjà planifié au calendrier, ou épisode déjà engagé. Seul un épisode
    // terminé (SORTI / CPA_INAPTE) laisse passer une nouvelle prise en charge.
    let patient = await this.patientBlocRepo.findOne({
      where: { patientId: prescription.patientId },
    });
    const episodeActif: PatientStatut[] = [
      PatientStatut.CPA_REALISE,
      PatientStatut.EN_ATTENTE_VERIFICATION_VEILLE,
      PatientStatut.VERIFICATION_VEILLE_REALISEE,
      PatientStatut.PRET_POUR_BLOC,
      PatientStatut.EN_COURS_OPERATION,
      PatientStatut.EN_SALLE_REVEIL,
    ];
    const [notificationDejaOuverte, creneauDejaPlanifie] = await Promise.all([
      this.notificationRepo.findOne({
        where: {
          patientId: prescription.patientId,
          statut: In([
            StatutNotificationCPA.EN_ATTENTE,
            StatutNotificationCPA.RDV_PLANIFIE,
          ]),
        },
      }),
      this.creneauRepo.findOne({
        where: {
          patientId: prescription.patientId,
          statut: StatutCreneau.PLANIFIE,
        },
      }),
    ]);
    const dejaPriseEnCharge =
      !!notificationDejaOuverte ||
      !!creneauDejaPlanifie ||
      (!!patient && episodeActif.includes(patient.statut));
    if (dejaPriseEnCharge) return;

    // Un patient déjà passé par le bloc (statut SORTI, CPA_INAPTE) peut revenir pour une
    // NOUVELLE prise en charge : cette prescription imagerie est un nouveau séjour, pas une
    // ré-ingestion de l'ancien. Le garde-fou ci-dessus écarte tout patient déjà pris en charge ;
    // ici on laisse passer, et la fiche PatientBloc est re-basculée en EN_ATTENTE_CPA pour ce
    // nouvel épisode (voir le bloc de création/mise à jour ci-dessous).

    // Échelle commune à tous les canaux (voir common/urgence.ts). L'ancien calcul local
    // ("tout ce qui ne commence pas par NORMAL est urgent") divergeait de mapUrgence utilisé
    // juste en dessous pour la fiche patient : un libellé inconnu marquait la notification
    // urgente alors que la fiche restait NORMAL.
    const niveauUrgence = niveauDepuisLibelle(prescription.urgence);
    const estUrgent = estNiveauUrgent(niveauUrgence);
    const prescripteurNom = [
      prescription.prescripteurPrenomManuel,
      prescription.prescripteurNomManuel,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();
    const serviceSourceNom = await this.serviceRegistryClient.getServiceName(
      prescription.serviceIdSource,
    );

    // Sans ceci, aucun PatientBloc n'existait jamais pour un patient venu d'une prescription
    // imagerie (contrairement aux prescriptions chirurgicales, voir PrescriptionService.ingerer) :
    // "Voir prescription" depuis la notification atterrissait sur "Patient introuvable"
    // (patientService.getById renvoyait null), et le patient n'apparaissait dans aucune liste du
    // bloc (Fil de travail...), toutes basées sur patients_bloc. Idempotent par patientId, comme
    // PatientBlocService.creerDepuisPrescription : un patient déjà suivi n'est jamais écrasé par
    // une prescription imagerie ultérieure (le circuit CPA/chirurgical prime). Un patient dont le
    // précédent séjour est terminé (SORTI / CPA_INAPTE) qui revient pour une nouvelle prise en
    // charge est, lui, re-basculé en EN_ATTENTE_CPA — sinon la nouvelle notification restait
    // invisible dans le fil "à traiter". Le patient réutilisé ici est celui du garde-fou
    // ci-dessus : il est forcément inconnu ou en épisode terminé.
    try {
      if (patient) {
        patient.statut = PatientStatut.EN_ATTENTE_CPA;
        patient.niveauUrgence = niveauUrgence;
        patient.serviceOrigineId = prescription.serviceIdSource || null;
        patient.serviceOrigine = serviceSourceNom || null;
        await this.patientBlocRepo.save(patient);
      } else {
        await this.patientBlocRepo.save(
          this.patientBlocRepo.create({
            patientId: prescription.patientId,
            chuId:
              prescription.chuId ||
              this.config.get<string>('externalServices.chuId') ||
              undefined,
            idDossier: construireIdDossier(prescription.patientId),
            groupeSanguin: 'INCONNU',
            libelle: prescription.type || 'Prescription imagerie',
            alertes: prescription.alertes || undefined,
            prescripteurId: prescription.prescripteurId,
            statut: PatientStatut.EN_ATTENTE_CPA,
            niveauUrgence,
            serviceOrigineId: prescription.serviceIdSource || undefined,
            serviceOrigine: serviceSourceNom || undefined,
          }),
        );
      }
    } catch (err) {
      this.logger.error(
        `❌ Échec création PatientBloc depuis la prescription imagerie pour ${prescription.patientId}: ${(err as Error).message}`,
      );
    }

    const notif = await this.notificationRepo.save(
      this.notificationRepo.create({
        heurePrescription: new Date().toTimeString().substring(0, 5),
        patientId: prescription.patientId,
        intervention: prescription.type || 'Prescription imagerie',
        chirurgienNom: prescripteurNom || undefined,
        serviceSourceId: prescription.serviceIdSource || undefined,
        serviceSourceNom: serviceSourceNom || undefined,
        estUrgent,
        statut: StatutNotificationCPA.EN_ATTENTE,
      }),
    );

    this.logger.log(
      `📋 Prescription imagerie ingérée pour le patient ${prescription.patientId} (${prescription.type || 'examen'})`,
    );

    await this.ingestionLedger.marquerIngeree({
      canal: CanalIngestion.PRESCRIPTION_IMAGERIE,
      referenceExterne: prescription.id,
      patientId: prescription.patientId,
      serviceSourceId: prescription.serviceIdSource,
      libelle: prescription.type || null,
    });

    // Sans ceci, cette notification n'était poussée à personne en temps réel : elle restait
    // invisible côté TopBar (pas de bip, pas de badge) jusqu'au prochain rafraîchissement
    // périodique (10s) — contrairement aux prescriptions bloc et aux demandes de CPA externes,
    // qui repoussent bien leur propre évènement après ingestion (voir PrescriptionService.ingerer
    // et DemandeCpaExterneService.create).
    await this.notificationBackClient.notifyService({
      serviceId: this.serviceId,
      title: estUrgent
        ? '🔴 Prescription imagerie urgente reçue'
        : '📋 Nouvelle prescription imagerie reçue',
      message: `${prescription.type || 'Examen imagerie'} — patient ${prescription.patientId}`,
      type: 'new_prescription',
      source: 'bloc-operatoire',
      data: {
        patientId: prescription.patientId,
        notificationId: notif.id,
        urgence: prescription.urgence,
      },
    });
  }
}
