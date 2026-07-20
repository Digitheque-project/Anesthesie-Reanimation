import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Repository, In } from 'typeorm';
import { DemandeCpaExterne, StatutDemandeCpaExterne } from '../entities/demande-cpa-externe.entity';
import { CreneauBloc, TypeRDV } from '../entities/creneau-bloc.entity';
import { ReceiveDemandeCpaDto } from './dto/receive-demande-cpa.dto';
import { UpdateDemandeCpaDto } from './dto/update-demande-cpa.dto';
import { PlanifierDemandeCpaDto } from './dto/planifier-demande-cpa.dto';
import { NotificationBackClient } from '../external/notification-back.client';
import { AccueilClient } from '../external/accueil.client';

@Injectable()
export class DemandeCpaExterneService {
  private readonly logger = new Logger(DemandeCpaExterneService.name);
  private readonly blocServiceId: string;

  constructor(
    @InjectRepository(DemandeCpaExterne) private repo: Repository<DemandeCpaExterne>,
    @InjectRepository(CreneauBloc) private creneauRepo: Repository<CreneauBloc>,
    private config: ConfigService,
    private http: HttpService,
    private notificationBackClient: NotificationBackClient,
    private accueilClient: AccueilClient,
  ) {
    this.blocServiceId = this.config.get<string>('externalServices.serviceId') ?? '';
  }

  async receive(dto: ReceiveDemandeCpaDto): Promise<DemandeCpaExterne> {
    const demande = this.repo.create({
      ...dto,
      dateExamenSouhaitee: dto.dateExamenSouhaitee ? new Date(dto.dateExamenSouhaitee) : undefined,
      chuId: this.config.get<string>('externalServices.chuId'),
      statut: StatutDemandeCpaExterne.EN_ATTENTE,
      payload: dto,
    });
    const saved = await this.repo.save(demande);
    this.logger.log(`📋 Demande de CPA externe reçue pour patient ${dto.patientId} (source: ${dto.sourceServiceName || dto.sourceServiceId})`);

    // Pousse la même notification temps réel que les prescriptions internes (voir
    // PrescriptionService.ingerer) — sans ça, cette demande n'apparaît que si l'utilisateur
    // ouvre manuellement la page /bloc/notification-cpa (aucune alerte sonore ni badge live).
    const estUrgent = (dto.urgence ?? 0) >= 4;
    await this.notificationBackClient.notifyService({
      serviceId: this.blocServiceId,
      title: estUrgent ? '🔴 Demande de CPA externe urgente' : '📋 Nouvelle demande de CPA externe',
      message: `${dto.motif || dto.typeAnesthesie} — patient ${dto.patientId} (${dto.sourceServiceName || dto.sourceServiceId})`,
      type: 'new_demande_cpa_externe',
      source: 'bloc-operatoire',
      data: { patientId: dto.patientId, demandeId: saved.id, urgence: dto.urgence },
    });

    return saved;
  }

  // L'identité (nom/prénom) vit dans le service Accueil, jamais dans cette table — le front ne
  // doit jamais afficher patientId à la place (interdit) : sans cet enrichissement, il n'a que
  // l'ID à se mettre sous la dent.
  async findAll(statut?: StatutDemandeCpaExterne) {
    const demandes = await this.repo.find({ where: statut ? { statut } : {}, order: { createdAt: 'DESC' } });
    try {
      return await this.accueilClient.enrichWithIdentity(demandes);
    } catch {
      return demandes;
    }
  }

  async findOne(id: string): Promise<DemandeCpaExterne> {
    const demande = await this.repo.findOne({ where: { id } });
    if (!demande) throw new NotFoundException(`Demande de CPA externe ${id} non trouvée`);
    try {
      return await this.accueilClient.enrichWithIdentity(demande);
    } catch {
      return demande;
    }
  }

  async update(id: string, dto: UpdateDemandeCpaDto): Promise<DemandeCpaExterne> {
    const demande = await this.findOne(id);
    Object.assign(demande, {
      ...dto,
      dateCpaPlanifiee: dto.dateCpaPlanifiee ? new Date(dto.dateCpaPlanifiee) : demande.dateCpaPlanifiee,
      dateVpaPlanifiee: dto.dateVpaPlanifiee ? new Date(dto.dateVpaPlanifiee) : demande.dateVpaPlanifiee,
    });
    return this.repo.save(demande);
  }

  // Planifie le rendez-vous CPA (ou vérification veille) pour cette demande externe : crée le
  // créneau réel (visible dans /bloc/rendez-vous comme n'importe quel autre RDV) et fait
  // avancer le statut de la demande en conséquence.
  async planifier(id: string, dto: PlanifierDemandeCpaDto): Promise<DemandeCpaExterne> {
    const demande = await this.findOne(id);
    const type = dto.type ?? TypeRDV.CPA;

    const creneau = this.creneauRepo.create({
      date: dto.date as any,
      heureDebut: dto.heureDebut,
      heureFin: dto.heureFin,
      salle: dto.salle,
      patientId: demande.patientId,
      chirurgienId: dto.chirurgienId ?? null,
      responsable: dto.responsable ?? null,
      type,
      estUrgence: (demande.urgence ?? 0) >= 4,
    });
    await this.creneauRepo.save(creneau);

    if (type === TypeRDV.VERIFICATION_VEILLE) {
      demande.statut = StatutDemandeCpaExterne.VPA_PLANIFIEE;
      demande.dateVpaPlanifiee = new Date(dto.date);
    } else {
      demande.statut = StatutDemandeCpaExterne.CPA_PLANIFIEE;
      demande.dateCpaPlanifiee = new Date(dto.date);
    }
    return this.repo.save(demande);
  }

  // Utilisée par les hooks CPA/VPA : trouve une demande externe encore ouverte pour ce patient.
  async trouverDemandeOuverte(patientId: string): Promise<DemandeCpaExterne | null> {
    return this.repo.findOne({
      where: {
        patientId,
        statut: In([StatutDemandeCpaExterne.EN_ATTENTE, StatutDemandeCpaExterne.CPA_PLANIFIEE, StatutDemandeCpaExterne.VPA_PLANIFIEE, StatutDemandeCpaExterne.CPA_REALISEE]),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async marquerCpaRealisee(demande: DemandeCpaExterne, cpaId: string, apte: boolean): Promise<DemandeCpaExterne> {
    demande.cpaId = cpaId;
    demande.statut = apte ? StatutDemandeCpaExterne.CPA_REALISEE : StatutDemandeCpaExterne.REPORTEE;
    return this.repo.save(demande);
  }

  async marquerVpaRealisee(demande: DemandeCpaExterne, vpaId: string): Promise<DemandeCpaExterne> {
    demande.vpaId = vpaId;
    demande.statut = StatutDemandeCpaExterne.CONFIRMEE;
    return this.repo.save(demande);
  }

  // Renvoie le résultat de la CPA/VPA au service demandeur. Deux canaux, envoyés
  // systématiquement (pas seulement pour Endoscopie) :
  //  1. Le service Notification, ciblé sur sourceServiceId (toujours fourni à la réception) —
  //     c'est le canal standard de l'écosystème, celui que chaque service écoute déjà en temps
  //     réel (le nôtre y compris). Le demandeur peut aussi interroger GET
  //     /demandes-cpa-externes/:id/statut (public) pour repartir de zéro s'il a manqué l'évènement.
  //  2. sourceCallbackUrl, si le service demandeur en a fourni une (best-effort, en plus).
  async notifierResultat(demande: DemandeCpaExterne, type: string, payload: any): Promise<void> {
    try {
      await this.notificationBackClient.notifyService({
        serviceId: demande.sourceServiceId,
        title: type === 'CPA_RESULTAT' ? '✅ Résultat de votre demande de CPA disponible' : '✅ Vérification veille réalisée',
        message: `Résultat disponible pour le patient ${demande.patientId} (réf. ${demande.sourceReferenceId})`,
        type: type === 'CPA_RESULTAT' ? 'demande_cpa_resultat' : 'demande_vpa_resultat',
        source: 'bloc-operatoire',
        data: { patientId: demande.patientId, demandeId: demande.id, entiteRefType: demande.sourceReferenceType, entiteRefId: demande.sourceReferenceId, ...payload },
      });
    } catch (err) {
      this.logger.error(`❌ Échec notification temps réel du résultat à ${demande.sourceServiceName || demande.sourceServiceId}: ${(err as Error).message}`);
    }

    if (!demande.sourceCallbackUrl) return;
    try {
      await firstValueFrom(
        this.http.post(demande.sourceCallbackUrl, {
          type,
          motif: `Résultat demande CPA/VPA pour patient ${demande.patientId}`,
          patientId: demande.patientId,
          entiteRefType: demande.sourceReferenceType,
          entiteRefId: demande.sourceReferenceId,
          emitter: this.blocServiceId,
          emitterName: 'Bloc Opératoire',
          recipient: demande.sourceServiceId,
          recipientName: demande.sourceServiceName,
          payload,
          createdAt: new Date().toISOString(),
        }),
      );
      this.logger.log(`✅ Résultat "${type}" renvoyé à ${demande.sourceServiceName || demande.sourceServiceId} pour patient ${demande.patientId}`);
    } catch (err) {
      this.logger.error(`❌ Échec envoi résultat "${type}" à ${demande.sourceServiceName || demande.sourceServiceId}: ${(err as Error).message}`);
    }
  }

  // Endpoint public : permet au service demandeur de vérifier l'état de sa demande sans notre
  // jeton SSO (il n'a pas de token scopé sur notre serviceId) — utile en secours de la
  // notification temps réel, ou en poll simple côté service demandeur.
  async findStatutPublic(id: string) {
    const demande = await this.findOne(id);
    return {
      id: demande.id,
      patientId: demande.patientId,
      sourceReferenceId: demande.sourceReferenceId,
      statut: demande.statut,
      cpaId: demande.cpaId || null,
      vpaId: demande.vpaId || null,
      dateCpaPlanifiee: demande.dateCpaPlanifiee || null,
      dateVpaPlanifiee: demande.dateVpaPlanifiee || null,
    };
  }
}
