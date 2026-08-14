import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Interval } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { In, Repository } from 'typeorm';
import { ReceivePrescriptionDto } from './dto/receive-prescription.dto';
import { PatientBloc, PatientStatut } from '../entities/patient-bloc.entity';
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
import { IngestionLedgerService } from '../ingestion/ingestion-ledger.service';
import { CanalIngestion } from '../entities/ingestion-externe.entity';
import { niveauDepuisLibelle, estNiveauUrgent } from '../common/urgence';
import { construireIdDossier } from '../common/id-dossier';

@Injectable()
export class PrescriptionService {
  private readonly logger = new Logger(PrescriptionService.name);
  private polling = false;
  private dernierPoll = 0;

  constructor(
    @InjectRepository(PatientBloc)
    private patientBlocRepo: Repository<PatientBloc>,
    @InjectRepository(NotificationCPA)
    private notificationRepo: Repository<NotificationCPA>,
    private prescriptionClient: PrescriptionExterneClient,
    private notificationBackClient: NotificationBackClient,
    private serviceRegistryClient: ServiceRegistryClient,
    private ingestionLedger: IngestionLedgerService,
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
    // Garde anti-chevauchement (un cycle en cours) + garde anti-rafale : l'écoute temps réel
    // (PrescriptionImagerieListenerService) déclenche ce poll à chaque évènement de prescription,
    // et le service Prescriptions (source de test en particulier) peut en émettre ~1/s — sans
    // cette garde, on martelait le service externe en GET. On n'exécute pas plus d'un cycle par
    // fenêtre de 5s ; un évènement ignoré est rattrapé par le prochain déclenchement.
    if (this.polling) return; // évite le chevauchement si un cycle précédent traîne
    const maintenant = Date.now();
    if (maintenant - this.dernierPoll < 5000) return;
    this.dernierPoll = maintenant;
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

  private extraireDateIntervention(
    p: PrescriptionBlocExterne,
    acte?: ActeBlocExterne,
  ): Date | undefined {
    // La date et l'heure prévues de l'opération sont fixées par le chirurgien sur l'acte
    // (Planification et Logistique) — le service Prescriptions les renvoie dans ActeBloc. Mais
    // seuls les services qui remplissent un ActeBloc complet (Chirurgie) le font : Urgence,
    // Endoscopie ou Consultation externe portent volontiers la date à la RACINE de la
    // prescription (champ `dateIntervention`, présent au contrat). Ne lire que l'acte perdait
    // purement et simplement leur date, et "Date et heure prévues de l'opération" restait vide.
    const source = acte?.dateIntervention ?? p.dateIntervention;
    if (!source) return undefined;
    const base = new Date(source);
    if (isNaN(base.getTime())) return undefined;
    const heure = acte?.heureIntervention;
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

  // Une prescription peut porter PLUSIEURS actes (interventions combinées lors d'un même passage
  // au bloc). Seul le premier était retenu : les suivants disparaissaient du libellé affiché à
  // l'équipe, qui ne voyait donc pas tout ce qui était prévu. On garde le premier acte comme
  // porteur des métadonnées (type de chirurgie, risque hémorragique, date/heure, chirurgien) et
  // on concatène tous les libellés.
  private libelleComplet(actes: ActeBlocExterne[]): string {
    const libelles = actes
      .map((a) => (a?.libelle || '').trim())
      .filter((l) => l !== '');
    return Array.from(new Set(libelles)).join(' + ');
  }

  private async ingerer(
    p: PrescriptionBlocExterne,
    serviceId: string,
  ): Promise<void> {
    // Déjà traitée lors d'un cycle précédent. On s'appuie sur le journal d'ingestion, pas sur
    // `PatientBloc.prescriptionExterneId` : cette colonne ne garde que la DERNIÈRE référence du
    // patient et perdait donc la trace des prescriptions antérieures (voir IngestionExterne).
    if (
      await this.ingestionLedger.dejaIngeree(
        CanalIngestion.PRESCRIPTION_BLOC,
        p.id,
      )
    ) {
      // Acquitter malgré tout : sans cela, une prescription déjà ingérée mais dont
      // l'acquittement avait échoué (service Prescriptions momentanément indisponible) restait
      // indéfiniment dans la file du service source, re-téléchargée à chaque cycle.
      await this.prescriptionClient.updateStatut(p.id, 'RECU_BLOC');
      return;
    }

    let patient = await this.patientBlocRepo.findOne({
      where: { patientId: p.patientId },
    });
    // Retour d'un patient dont le précédent épisode est terminé (SORTI / CPA_INAPTE) : sa
    // nouvelle prescription (ex. du service Chirurgie) est une NOUVELLE prise en charge — on le
    // traite comme un nouveau patient qui arrive (réouverture du dossier en EN_ATTENTE_CPA +
    // nouvelle notification, voir le bloc de création/mise à jour ci-dessous). Les restes du
    // précédent épisode (notification encore ouverte, créneau encore planifié) n'ont plus cours
    // et ne doivent donc pas le bloquer.
    const episodeTermine: PatientStatut[] = [
      PatientStatut.SORTI,
      PatientStatut.CPA_INAPTE,
    ];
    const retourPatient = !!patient && episodeTermine.includes(patient.statut);

    // Anti-ré-ingestion ciblée : une nouvelle prescription (nouvel `id`) doit ARRIVER dans la
    // cloche — sauf si c'est manifestement la re-poussée de la même intervention déjà en cours.
    // Le service Prescriptions peut renvoyer un `id` différent à chaque interrogation pour ce
    // qui est conceptuellement la même prescription (ex: source de test sans persistance), ce
    // qui faisait réapparaître le patient dans la cloche même après planification de son RDV CPA.
    // On ne bloque donc que :
    //  - patient en cours d'opération / en salle de réveil (épisode chirurgical réellement engagé) ;
    //  - même intervention déjà ouverte : notification EN_ATTENTE / RDV_PLANIFIE pour le même
    //    acte, ou libellé d'acte du patient identique à la prescription entrante.
    // Un ancien RDV / créneau sur une AUTRE intervention ne bloque plus : c'est un nouveau
    // passage au bloc → on traite le patient comme un nouveau patient qui arrive.
    const enCoursOperation: PatientStatut[] = [
      PatientStatut.EN_COURS_OPERATION,
      PatientStatut.EN_SALLE_REVEIL,
    ];
    const notificationDejaOuverte = await this.notificationRepo.findOne({
      where: {
        patientId: p.patientId,
        statut: In([
          StatutNotificationCPA.EN_ATTENTE,
          StatutNotificationCPA.RDV_PLANIFIE,
        ]),
      },
    });
    // `actes` (contrat courant) ou `ActeBloc` (nom historique) — un service peut n'en fournir
    // aucun (prescription de bloc simple, sans acte détaillé : Urgence, Endoscopie...).
    const actes = p.actes ?? p.ActeBloc ?? [];
    const acte = actes[0];
    const libelleEntrant = this.libelleComplet(actes);
    const interventionEntrante = libelleEntrant.toLowerCase();
    const memeInterventionOuverte =
      interventionEntrante !== '' &&
      ((!!notificationDejaOuverte &&
        (notificationDejaOuverte.intervention || '').trim().toLowerCase() ===
          interventionEntrante) ||
        (!!patient &&
          (patient.libelle || '').trim().toLowerCase() === interventionEntrante));
    // Prescription sans acte nommé (Urgence, Endoscopie, Consultation externe...) : aucun
    // libellé ne permet de distinguer deux demandes successives. Une notification déjà ouverte
    // pour ce patient vaut alors "même demande" — sinon la garde par libellé ne s'appliquait
    // jamais à ces prescriptions, et le service source qui renvoie un `id` différent à chaque
    // interrogation faisait réapparaître le patient dans la cloche, avec carillon, toutes les
    // 15 secondes.
    const demandeSansLibelleDejaOuverte =
      interventionEntrante === '' && !!notificationDejaOuverte;
    const dejaPriseEnCharge =
      !retourPatient &&
      ((!!patient && enCoursOperation.includes(patient.statut)) ||
        memeInterventionOuverte ||
        demandeSansLibelleDejaOuverte);
    if (dejaPriseEnCharge) {
      this.logger.log(
        `🛡️ Ingestion ignorée : patient ${p.patientId}` +
          (memeInterventionOuverte
            ? ` — même intervention "${libelleEntrant}" déjà en cours`
            : demandeSansLibelleDejaOuverte
              ? ' — demande sans acte nommé, notification déjà ouverte'
              : ` — statut ${patient?.statut}, opération en cours`),
      );
      // Ignorée ≠ jamais reçue : sans cet acquittement, la prescription restait DEMANDE_CPA côté
      // service source, donc renvoyée par getPrescriptionsBloc à CHAQUE cycle (toutes les 15 s,
      // et à chaque évènement temps réel) — la file du service demandeur ne se vidait jamais et
      // le bloc rejouait indéfiniment les mêmes lignes. C'est très exactement l'échec que
      // signale le script test-prescription-arrivee.mjs ("toujours bloquée").
      await this.ingestionLedger.marquerIngeree({
        canal: CanalIngestion.PRESCRIPTION_BLOC,
        referenceExterne: p.id,
        patientId: p.patientId,
        serviceSourceId: p.serviceIdSource,
        libelle: libelleEntrant || null,
      });
      await this.prescriptionClient.updateStatut(p.id, 'RECU_BLOC');
      return;
    }
    if (retourPatient) {
      this.logger.log(
        `↩️ Patient ${p.patientId} revient d'un épisode terminé (${patient!.statut}) — nouvelle prescription traitée comme une nouvelle prise en charge`,
      );
    }
    const niveauUrgence = niveauDepuisLibelle(p.urgence);
    const dateIntervention = this.extraireDateIntervention(p, acte);
    // Le service Prescriptions ne transmet que l'id du service demandeur, jamais son nom — sans
    // cette résolution, "service source" restait vide partout où ce patient est affiché (fiche
    // patient, prescription au sein de la CPA, notification).
    const serviceSourceNom = await this.serviceRegistryClient.getServiceName(
      p.serviceIdSource,
    );
    const donneesPatient = {
      patientId: p.patientId,
      chuId: p.chuId,
      idDossier: patient?.idDossier || construireIdDossier(p.patientId),
      groupeSanguin: patient?.groupeSanguin || 'INCONNU',
      libelle: libelleEntrant || undefined,
      risqueHemorragique: acte?.risqueHemorragique || undefined,
      typeChirurgie: acte?.typeChirurgie || undefined,
      consignes: p.consignes || undefined,
      dateIntervention,
      alertes: p.alertes || undefined,
      prescripteurId: p.prescripteurId,
      chirurgien_nom: (acte?.nomChirurgien ?? p.chirurgien) || undefined,
      // On n'arrive ici que pour un patient inconnu, un patient en épisode terminé (SORTI /
      // CPA_INAPTE), ou une nouvelle intervention différente de celle déjà en cours — le garde
      // ci-dessus a exclu les re-poussées d'une même intervention et les opérations en cours.
      // Rebasculement en EN_ATTENTE_CPA = nouvelle prise en charge.
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
        intervention: libelleEntrant || 'Intervention',
        chirurgienId: undefined,
        chirurgienNom: (acte?.nomChirurgien ?? p.chirurgien) || undefined,
        professeurCPA: undefined,
        serviceSourceId: p.serviceIdSource || undefined,
        serviceSourceNom: serviceSourceNom || undefined,
        estUrgent: estNiveauUrgent(niveauUrgence),
        statut: StatutNotificationCPA.EN_ATTENTE,
      }),
    );

    this.logger.log(
      `📋 Nouvelle prescription bloc ingérée pour patient ${p.patientId} (${libelleEntrant || 'intervention'})`,
    );

    await this.ingestionLedger.marquerIngeree({
      canal: CanalIngestion.PRESCRIPTION_BLOC,
      referenceExterne: p.id,
      patientId: p.patientId,
      serviceSourceId: p.serviceIdSource,
      libelle: libelleEntrant || null,
    });
    await this.prescriptionClient.updateStatut(p.id, 'RECU_BLOC');

    await this.notificationBackClient.notifyService({
      serviceId,
      title: estNiveauUrgent(niveauUrgence)
        ? '🔴 Prescription urgente reçue'
        : '📋 Nouvelle prescription reçue',
      message: `${libelleEntrant || 'Intervention'} — patient ${p.patientId}`,
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
