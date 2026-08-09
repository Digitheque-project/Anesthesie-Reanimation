import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { In, Repository } from 'typeorm';
import {
  NotificationCPA,
  StatutNotificationCPA,
} from '../entities/notification-cpa.entity';
import { WebhookNotification } from '../entities/webhook-notification.entity';
import { PatientBloc } from '../entities/patient-bloc.entity';
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
    // on ne pagine qu'une fois, sur la liste fusionnée et triée.
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
    const patientIds = Array.from(
      new Set(internalDataRaw.map((n) => n.patientId).filter(Boolean)),
    );
    const patients = patientIds.length
      ? await this.patientBlocRepo.find({
          where: { patientId: In(patientIds) },
        })
      : [];
    const patientMap = new Map(patients.map((p) => [p.patientId, p]));
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
        },
      };
    });

    const externalData = await this.webhookRepo.find({
      order: { receivedAt: 'DESC' },
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

    const start = (page - 1) * limite;
    const end = start + limite;
    const paginated = merged.slice(start, end);

    return {
      data: paginated,
      total: merged.length,
      page,
      pages: Math.ceil(merged.length / limite),
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
