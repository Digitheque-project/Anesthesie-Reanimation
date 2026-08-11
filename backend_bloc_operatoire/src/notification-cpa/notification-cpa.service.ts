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
import { CPA } from '../entities/cpa.entity';
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
    @InjectRepository(CPA)
    private readonly cpaRepo: Repository<CPA>,
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
    // dont la CPA est déjà traitée (statut différent de EN_ATTENTE_CPA). Les vraies ingestions
    // passent par PrescriptionService.ingerer / l'écoute imagerie, qui portent déjà ce garde-fou ;
    // celui-ci protège cet endpoint générique si un appelant l'utilise directement pour
    // ré-pousser une prescription déjà prise en charge.
    if (!dto.statut || dto.statut === StatutNotificationCPA.EN_ATTENTE) {
      const patient = await this.patientBlocRepo.findOne({
        where: { patientId: dto.patientId },
      });
      if (patient && patient.statut !== PatientStatut.EN_ATTENTE_CPA) {
        this.logger.warn(
          `Création d'une notification EN_ATTENTE refusée : patient ${dto.patientId} déjà traité (statut ${patient.statut})`,
        );
        throw new ConflictException(
          `Patient ${dto.patientId} déjà traité (statut ${patient.statut}) — notification non créée.`,
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
    // pour exclure du fil "à traiter" les patients dont la CPA est déjà traitée. On récupère
    // aussi la dernière CPA (par date de consultation) de chaque patient : un patient dont la
    // CPA a déjà été tranchée (APTE/INAPTE, opération non reportée) est traité même quand son
    // PatientBloc est resté bloqué sur EN_ATTENTE_CPA — et même si la fiche PatientBloc a été
    // supprimée.
    const patientIds = Array.from(
      new Set(
        [...internalDataRaw, ...externalDataRaw]
          .map((n) => n.patientId)
          .filter(Boolean),
      ),
    );
    const [patients, cpas]: [PatientBloc[], CPA[]] = await Promise.all([
      patientIds.length
        ? this.patientBlocRepo.find({
            where: { patientId: In(patientIds) },
          })
        : [],
      patientIds.length
        ? this.cpaRepo.find({
            where: { patientId: In(patientIds) },
          })
        : [],
    ]);
    const patientMap = new Map(patients.map((p) => [p.patientId, p]));
    const derniereCpaParPatient = new Map<string, CPA>();
    for (const c of cpas) {
      const existante = derniereCpaParPatient.get(c.patientId);
      if (
        !existante ||
        new Date(c.dateConsultation) > new Date(existante.dateConsultation)
      ) {
        derniereCpaParPatient.set(c.patientId, c);
      }
    }

    // Une CPA "finale" (décision APTE/INAPTE, opération retenue/refusée — pas simplement
    // reportée) vaut prise en charge : le patient ne doit plus être proposé à la planification.
    const cpaTraitee = (c?: CPA): boolean =>
      !!c &&
      ['APTE', 'INAPTE'].includes(c.decision) &&
      c.decisionOperation !== 'REPORTEE';

    const estPatientTraite = (statut?: string, cpa?: CPA): boolean =>
      (!!statut && statut !== PatientStatut.EN_ATTENTE_CPA) ||
      cpaTraitee(cpa);

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
          cpaFinaleRealisee: cpaTraitee(derniereCpaParPatient.get(n.patientId)),
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
              cpaFinaleRealisee: cpaTraitee(
                derniereCpaParPatient.get(n.patientId),
              ),
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
    // patient est déjà traité (CPA réalisée/inapte — y compris via une dernière CPA APTE/INAPTE
    // alors que le PatientBloc traîne en EN_ATTENTE_CPA —, vérification veille, prêt pour bloc,
    // opération, réveil, sortie) est incohérente — ré-ingestion d'une prescription déjà prise en
    // charge, données héritées d'avant les garde-fous d'ingestion... On l'exclut du fil "à
    // traiter". Les statuts RDV_PLANIFIE / REALISE restent disponibles pour l'historique et les
    // filtres dédiés (ils sont, eux, volontairement consommés par les filtres de la page).
    const actionnables = merged.filter(
      (n: any) =>
        n.statut !== StatutNotificationCPA.EN_ATTENTE ||
        !estPatientTraite(
          n.patient?.statut,
          derniereCpaParPatient.get(n.patientId),
        ),
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

    try {
      const patient = await this.patientBlocRepo.findOne({
        where: { patientId: n.patientId },
      });
      if (patient?.serviceOrigineId && patient?.serviceOrigine) {
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
    const internalUnread = await this.notificationRepo.count({
      where: { statut: StatutNotificationCPA.EN_ATTENTE, lu: false },
    });
    const externalUnread = await this.webhookRepo.count({
      where: { processed: false },
    });
    return internalUnread + externalUnread;
  }
}
