import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { In, Repository } from 'typeorm';
import {
  NotificationCPA,
  StatutNotificationCPA,
} from '../entities/notification-cpa.entity';
import { WebhookNotification } from '../entities/webhook-notification.entity';
import { PatientBloc, PatientStatut } from '../entities/patient-bloc.entity';
import { CreneauBloc, StatutCreneau } from '../entities/creneau-bloc.entity';
import { AccueilClient } from '../external/accueil.client';
import { MedecinIdentiteService } from '../medecin/medecin-identite.service';
import { NotificationOutgoingService } from '../external/notification-outgoing.service';
import { NotificationBackClient } from '../external/notification-back.client';
import { CreateNotificationCPADto } from './dto/create-notification-cpa.dto';
import { UpdateNotificationCPADto } from './dto/update-notification-cpa.dto';

@Injectable()
export class NotificationCPAService {
  private readonly logger = new Logger(NotificationCPAService.name);
  private readonly blocServiceId: string;

  constructor(
    @InjectRepository(NotificationCPA)
    private readonly notificationRepo: Repository<NotificationCPA>,
    @InjectRepository(WebhookNotification)
    private readonly webhookRepo: Repository<WebhookNotification>,
    @InjectRepository(PatientBloc)
    private readonly patientBlocRepo: Repository<PatientBloc>,
    @InjectRepository(CreneauBloc)
    private readonly creneauRepo: Repository<CreneauBloc>,
    private accueilClient: AccueilClient,
    private medecinIdentiteService: MedecinIdentiteService,
    private notificationOutgoing: NotificationOutgoingService,
    private notificationBackClient: NotificationBackClient,
    private config: ConfigService,
  ) {
    this.blocServiceId =
      this.config.get<string>('externalServices.serviceId') ?? '';
  }

  async create(dto: CreateNotificationCPADto): Promise<NotificationCPA> {
    // Filet anti-réapparition : refuser de créer une notification "en attente" pour un patient
    // en pleine prise en charge (CPA réalisée, vérification veille, prêt bloc, opération, réveil).
    // Les vraies ingestions passent par PrescriptionService.ingerer / l'écoute imagerie, qui
    // portent déjà ce garde-fou ; celui-ci protège cet endpoint générique si un appelant
    // l'utilise directement pour ré-pousser une prescription déjà prise en charge.
    // Un patient SORTI (ou CPA_INAPTE) dont le précédent séjour est terminé peut, lui, revenir
    // pour une NOUVELLE prise en charge : sa notification EN_ATTENTE ne doit pas être refusée.
    const statutsEpisodeEnCours: PatientStatut[] = [
      PatientStatut.CPA_REALISE,
      PatientStatut.EN_ATTENTE_VERIFICATION_VEILLE,
      PatientStatut.VERIFICATION_VEILLE_REALISEE,
      PatientStatut.PRET_POUR_BLOC,
      PatientStatut.EN_COURS_OPERATION,
      PatientStatut.EN_SALLE_REVEIL,
    ];
    if (!dto.statut || dto.statut === StatutNotificationCPA.EN_ATTENTE) {
      const patient = await this.patientBlocRepo.findOne({
        where: { patientId: dto.patientId },
      });
      if (
        patient &&
        statutsEpisodeEnCours.includes(patient.statut)
      ) {
        this.logger.warn(
          `Création d'une notification EN_ATTENTE refusée : patient ${dto.patientId} en cours de prise en charge (statut ${patient.statut})`,
        );
        throw new ConflictException(
          `Patient ${dto.patientId} déjà en cours de prise en charge (statut ${patient.statut}) — notification non créée.`,
        );
      }
      // Un RDV déjà planifié au calendrier est lui aussi une prise en charge engagée : la même
      // prescription ne doit pas être re-poussée comme nouvelle notification pour un patient
      // qui a déjà son RDV CPA (voir le garde-fou d'ingestion dans PrescriptionService.ingerer).
      const creneauDejaPlanifie = await this.creneauRepo.findOne({
        where: { patientId: dto.patientId, statut: StatutCreneau.PLANIFIE },
      });
      if (creneauDejaPlanifie) {
        this.logger.warn(
          `Création d'une notification EN_ATTENTE refusée : patient ${dto.patientId} a déjà un créneau planifié (${creneauDejaPlanifie.type} le ${creneauDejaPlanifie.date})`,
        );
        throw new ConflictException(
          `Patient ${dto.patientId} a déjà un RDV planifié — notification non créée.`,
        );
      }
    }
    const saved = await this.notificationRepo.save(
      this.notificationRepo.create(dto),
    );
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async findAll(page = 1, limite = 10) {
    // Fusionner deux sources paginées séparément (internes + externes) puis ne trancher que la
    // page demandée sur le résultat déjà tronqué produisait une pagination fausse : la page 2+
    // réaffichait les mêmes notifications externes qu'en page 1 (jamais de `skip` côté webhook),
    // et `total`/`pages` ne reflétaient que les lots déjà limités, pas le nombre réel. On
    // récupère donc l'intégralité des deux sources (volumes hospitaliers, pas internet-scale) et
    // on ne pagine qu'une fois, sur la liste fusionnée, filtrée et triée.
    const internalDataRaw = await this.notificationRepo.find({
      order: { createdAt: 'DESC' },
    });
    const identities =
      await this.accueilClient.enrichWithIdentity(internalDataRaw);
    const avecChirurgien = await this.medecinIdentiteService.enrichir(
      internalDataRaw,
      'chirurgienId',
      'chirurgien',
    );
    const externalDataRaw = await this.webhookRepo.find({
      order: { receivedAt: 'DESC' },
    });

    // Enrichissement PatientBloc partagé entre les deux sources (notifications internes et
    // webhooks externes) : c'est lui qui fournit le statut courant du patient, utilisé plus bas
    // pour exclure du fil "à traiter" les patients dont la CPA est déjà traitée.
    const patientIds = Array.from(
      new Set(
        [...internalDataRaw, ...externalDataRaw]
          .map((n) => n.patientId)
          .filter(Boolean),
      ),
    );
    const [patients, creneaux] = await Promise.all([
      patientIds.length
        ? this.patientBlocRepo.find({
            where: { patientId: In(patientIds) },
          })
        : Promise.resolve([]),
      patientIds.length
        ? this.creneauRepo.find({
            where: { patientId: In(patientIds) },
          })
        : Promise.resolve([]),
    ]);
    const patientMap = new Map(patients.map((p) => [p.patientId, p]));
    // Un RDV déjà planifié au calendrier = patient pris en charge : sa ligne EN_ATTENTE obsolète
    // (ré-ingestion antérieure au garde-fou) ne doit pas rester actionnable dans la cloche.
    const patientsAvecRdvPlanifie = new Set(
      creneaux
        .filter((c) => c.statut === StatutCreneau.PLANIFIE)
        .map((c) => c.patientId),
    );

    const estPatientTraite = (patientId?: string, statut?: string) => {
      if (patientId && patientsAvecRdvPlanifie.has(patientId)) return true;
      return !!statut && statut !== PatientStatut.EN_ATTENTE_CPA;
    };

    const internalData = internalDataRaw.map((n, idx) => {
      const identity = identities[idx] || {};
      const pb = patientMap.get(n.patientId);
      return {
        ...n,
        chirurgien: avecChirurgien[idx]?.chirurgien ?? null,
        patient: {
          id: n.patientId,
          nom: identity.nom,
          prenom: identity.prenom,
          idDossier: identity.idDossier ?? pb?.idDossier,
          statut: pb?.statut,
          niveauUrgence: pb?.niveauUrgence,
          dateIntervention: pb?.dateIntervention ?? null,
        },
      };
    });

    // Les lignes webhook n'avaient jamais de `patient` enrichi : impossible pour le frontend de
    // savoir si le patient était déjà traité (estPatientTraite renvoyait toujours false), donc un
    // patient pris en charge réapparaissait dans le fil de prescription via sa ligne webhook. On
    // leur porte le même objet patient (statut courant du PatientBloc).
    const externalData = externalDataRaw.map((n) => {
      const pb = patientMap.get(n.patientId);
      return {
        ...n,
        patient: pb
          ? {
              id: n.patientId,
              statut: pb.statut,
              niveauUrgence: pb.niveauUrgence,
              dateIntervention: pb.dateIntervention ?? null,
            }
          : undefined,
      };
    });

    const merged = [...internalData, ...externalData];
    merged.sort((a, b) => {
      const getDate = (item: any) => {
        if (item.createdAt) return new Date(item.createdAt).getTime();
        if (item.receivedAt) return new Date(item.receivedAt).getTime();
        return 0;
      };
      return getDate(b) - getDate(a);
    });

    // Filet de sécurité contre les réapparitions : une notification encore EN_ATTENTE dont le
    // patient est déjà traité (CPA réalisée/inapte, vérification veille, prêt pour bloc,
    // opération, réveil, sortie) est incohérente — ré-ingestion d'une prescription déjà prise en
    // charge, données héritées d'avant les garde-fous d'ingestion... On l'exclut du fil "à
    // traiter". Les statuts RDV_PLANIFIE / REALISE restent disponibles pour l'historique et les
    // filtres dédiés (ils sont, eux, volontairement consommés par les filtres de la page).
    const actionnables = merged.filter(
      (n: any) =>
        n.statut !== StatutNotificationCPA.EN_ATTENTE ||
        !estPatientTraite(n.patient?.id, n.patient?.statut),
    );

    const start = (page - 1) * limite;
    const end = start + limite;
    const paginated = actionnables.slice(start, end);

    return {
      data: paginated,
      total: actionnables.length,
      page,
      pages: Math.ceil(actionnables.length / limite),
    };
  }

  async findOne(id: string): Promise<any> {
    const n = await this.notificationRepo.findOne({ where: { id } });
    if (!n) throw new NotFoundException(`Notification ${id} non trouvée`);
    const [enrichedPatient] = await this.accueilClient.enrichWithIdentity([n]);
    const [enriched] = await this.medecinIdentiteService.enrichir(
      [enrichedPatient],
      'chirurgienId',
      'chirurgien',
    );
    return enriched;
  }

  async planifierRDV(id: string, dto: any): Promise<NotificationCPA> {
    const n = await this.notificationRepo.findOne({ where: { id } });
    if (!n) throw new NotFoundException(`Notification ${id} non trouvée`);
    n.statut = StatutNotificationCPA.RDV_PLANIFIE;
    // Planifier = consommer la ligne : le RDV existe désormais au calendrier, la notification ne
    // doit plus apparaître dans la cloche comme une prescription à traiter (la popup ne filtre que
    // `lu`/`estPatientTraite`, pas le statut — sans ceci, un patient planifié restait visible avec
    // un bouton "Voir prescription" dans la cloche).
    n.lu = true;
    n.luLe = new Date();

    try {
      const patient = await this.patientBlocRepo.findOne({
        where: { patientId: n.patientId },
      });
      // Seul l'identifiant du service est nécessaire pour l'avertir : exiger aussi son nom
      // (résolu best-effort auprès du registre central) privait de retour tout service dont le
      // nom n'a pas pu être résolu — voir NotificationOutgoingService.notifyOriginService.
      if (patient?.serviceOrigineId) {
        await this.notificationOutgoing.notifyOriginService({
          patientId: n.patientId,
          type: 'RDV_CPA_PLANIFIE',
          serviceOrigineId: patient.serviceOrigineId,
          serviceOrigineName: patient.serviceOrigine,
          payload: {
            intervention: n.intervention,
            professeurCPA: n.professeurCPA,
            estUrgent: n.estUrgent,
            datePlanification: new Date().toISOString(),
          },
        });
      }
    } catch (err) {
      this.logger.error(
        `Erreur notification service origine après planification RDV CPA: ${(err as Error).message}`,
      );
    }

    const saved = await this.notificationRepo.save(n);
    // La prescription de ce patient peut aussi avoir été reçue par webhook (même épisode) : sa
    // ligne restait `processed: false`, donc après planification la cloche recomptait ce doublon
    // comme non lu et le fil comme une nouvelle notification (carillon), alors que le RDV vient
    // d'être planifié. On bascule ces lignes à `true` — le patient est pris en charge.
    if (n.patientId) {
      await this.webhookRepo
        .update({ patientId: n.patientId }, { processed: true })
        .catch(() => {});
    }
    // Retire cette notification de la liste "à planifier" sur tous les postes connectés du
    // bloc, sans attendre un rechargement manuel — même canal que les nouvelles prescriptions,
    // type ignoré par TopBar (voir PatientBlocStatutService.diffuserChangementStatut).
    this.notificationBackClient
      .notifyService({
        serviceId: this.blocServiceId,
        title: 'RDV CPA planifié',
        message: `Notification ${id} planifiée`,
        type: 'patient_statut_change',
        source: 'bloc-operatoire',
        data: { notificationId: id, patientId: n.patientId },
      })
      .catch(() => {});
    return saved;
  }

  async update(
    id: string,
    dto: UpdateNotificationCPADto,
  ): Promise<NotificationCPA> {
    const n = await this.notificationRepo.findOne({ where: { id } });
    if (!n) throw new NotFoundException(`Notification ${id} non trouvée`);
    return this.notificationRepo.save(Object.assign(n, dto));
  }

  // Marque la notification comme vue/écartée — indépendant de `statut`, qui suit l'avancement
  // du traitement (planifié, réalisé...). Une notification peut être lue sans être traitée.
  async marquerLu(id: string): Promise<NotificationCPA> {
    const n = await this.notificationRepo.findOne({ where: { id } });
    if (!n) throw new NotFoundException(`Notification ${id} non trouvée`);
    n.lu = true;
    n.luLe = new Date();
    return this.notificationRepo.save(n);
  }

  async remove(id: string): Promise<{ message: string }> {
    const n = await this.notificationRepo.findOne({ where: { id } });
    if (!n) throw new NotFoundException(`Notification ${id} non trouvée`);
    await this.notificationRepo.delete(id);
    return { message: 'Notification supprimée' };
  }

  async getUnreadCount(): Promise<number> {
    // "Non lu" = pas encore traité ET pas encore écarté par l'utilisateur — un item déjà
    // planifié/réalisé n'a plus besoin d'attention, tout comme un item explicitement marqué lu.
    // Applique le même filtre que findAll : un patient dont la prise en charge est engagée
    // (RDV planifié au calendrier, CPA faite, parcours avancé...) ne doit pas compter, même si
    // une ligne EN_ATTENTE obsolète traîne encore (ré-ingestion avant le garde-fou, etc.).
    const [internalRaw, externalRaw] = await Promise.all([
      this.notificationRepo.find({
        where: { statut: StatutNotificationCPA.EN_ATTENTE, lu: false },
      }),
      this.webhookRepo.find({ where: { processed: false } }),
    ]);

    const ids = Array.from(
      new Set(
        [...internalRaw, ...externalRaw]
          .map((n) => n.patientId)
          .filter(Boolean),
      ),
    );
    if (ids.length === 0) return 0;

    const [patients, creneaux] = await Promise.all([
      this.patientBlocRepo.find({ where: { patientId: In(ids) } }),
      this.creneauRepo.find({ where: { patientId: In(ids) } }),
    ]);
    const statutPatient = new Map(patients.map((p) => [p.patientId, p.statut]));
    const dejaPlanifie = new Set(
      creneaux
        .filter((c) => c.statut === StatutCreneau.PLANIFIE)
        .map((c) => c.patientId),
    );
    // Mêmes statuts "traités" que STATUTS_PATIENT_TRAITES côté frontend (patient-traite.ts).
    const statutsTraites = new Set<PatientStatut>([
      PatientStatut.CPA_REALISE,
      PatientStatut.CPA_INAPTE,
      PatientStatut.EN_ATTENTE_VERIFICATION_VEILLE,
      PatientStatut.VERIFICATION_VEILLE_REALISEE,
      PatientStatut.PRET_POUR_BLOC,
      PatientStatut.EN_COURS_OPERATION,
      PatientStatut.EN_SALLE_REVEIL,
      PatientStatut.SORTI,
    ]);
    const patientDejaPriseEnCharge = (patientId?: string) => {
      if (!patientId) return false;
      const statut = statutPatient.get(patientId);
      return dejaPlanifie.has(patientId) || (!!statut && statutsTraites.has(statut));
    };

    const internalUnread = internalRaw.filter(
      (n) => !patientDejaPriseEnCharge(n.patientId),
    ).length;
    const externalUnread = externalRaw.filter(
      (n) => !patientDejaPriseEnCharge(n.patientId),
    ).length;
    return internalUnread + externalUnread;
  }
}
