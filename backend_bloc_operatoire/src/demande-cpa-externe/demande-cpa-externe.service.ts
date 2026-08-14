import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Repository, In } from 'typeorm';
import {
  DemandeCpaExterne,
  StatutDemandeCpaExterne,
} from '../entities/demande-cpa-externe.entity';
import { CreneauBloc, TypeRDV } from '../entities/creneau-bloc.entity';
import { CPA } from '../entities/cpa.entity';
import { ReceiveDemandeCpaDto } from './dto/receive-demande-cpa.dto';
import { UpdateDemandeCpaDto } from './dto/update-demande-cpa.dto';
import { PlanifierDemandeCpaDto } from './dto/planifier-demande-cpa.dto';
import { StatutDemandeCpaPubliqueDto } from './dto/statut-demande-cpa-publique.dto';
import { NotificationBackClient } from '../external/notification-back.client';
import { AccueilClient } from '../external/accueil.client';
import { PatientBlocService } from '../patient-bloc/patient-bloc.service';
import { ServiceRegistryClient } from '../external/service-registry.client';
import { verifierCreneauValide } from '../planning/creneau-validation.util';
import { niveauDepuisEchelle, estNiveauUrgent } from '../common/urgence';

@Injectable()
export class DemandeCpaExterneService {
  private readonly logger = new Logger(DemandeCpaExterneService.name);
  private readonly blocServiceId: string;

  constructor(
    @InjectRepository(DemandeCpaExterne)
    private repo: Repository<DemandeCpaExterne>,
    @InjectRepository(CreneauBloc) private creneauRepo: Repository<CreneauBloc>,
    @InjectRepository(CPA) private cpaRepo: Repository<CPA>,
    private config: ConfigService,
    private http: HttpService,
    private notificationBackClient: NotificationBackClient,
    private accueilClient: AccueilClient,
    private patientBlocService: PatientBlocService,
    private serviceRegistryClient: ServiceRegistryClient,
  ) {
    this.blocServiceId =
      this.config.get<string>('externalServices.serviceId') ?? '';
  }

  async receive(dto: ReceiveDemandeCpaDto): Promise<DemandeCpaExterne> {
    // Webhook public → idempotence obligatoire : le service demandeur (ou un middleware de
    // retry / une ré-émission) peut reposter la même demande pour le même patient. Sans ce
    // garde, un re-push créait une NOUVELLE ligne EN_ATTENTE (nouveau son + réapparition dans
    // la cloche), re-basculait le PatientBloc en EN_ATTENTE_CPA et re-poussait l'évènement
    // temps réel — y compris après planification du rendez-vous.
    const existante = await this.repo.findOne({
      where: {
        patientId: dto.patientId,
        sourceReferenceType: dto.sourceReferenceType,
        sourceReferenceId: dto.sourceReferenceId,
      },
      order: { createdAt: 'DESC' },
    });
    if (existante) {
      this.logger.log(
        `↩️ Demande de CPA externe déjà reçue pour le patient ${dto.patientId} (réf. ${dto.sourceReferenceId}) — ignorée (idempotent)`,
      );
      return existante;
    }

    // Le nom du service source n'est jamais fiable tel que transmis (souvent absent, parfois
    // périmé) — résolu en direct auprès du registre central des services à partir du seul
    // identifiant transmis, plutôt que stocké quelque part. N'importe quel service peut être à
    // l'origine d'une demande (Endoscopie, Imagerie, Urgence...), pas seulement ceux connus
    // d'avance : jamais de liste ou d'id figé en dur ici ou en configuration.
    const sourceServiceName =
      (await this.serviceRegistryClient.getServiceName(dto.sourceServiceId)) ||
      dto.sourceServiceName;

    const demande = this.repo.create({
      ...dto,
      sourceServiceName,
      dateExamenSouhaitee: dto.dateExamenSouhaitee
        ? new Date(dto.dateExamenSouhaitee)
        : undefined,
      chuId: this.config.get<string>('externalServices.chuId'),
      statut: StatutDemandeCpaExterne.EN_ATTENTE,
      payload: dto,
    });
    const saved = await this.repo.save(demande);
    this.logger.log(
      `📋 Demande de CPA externe reçue pour patient ${dto.patientId} (source: ${dto.sourceServiceName || dto.sourceServiceId})`,
    );

    // Sans ceci, aucun PatientBloc n'existait jamais pour un patient venu par une demande CPA
    // externe : niveauUrgence restait introuvable côté /bloc/consultation-cpa (patient.getById
    // renvoyait null), donc un patient très urgent n'était jamais réellement basculé en VPA —
    // seul le badge "urgent" de la notification s'affichait, sans effet sur le parcours réel.
    try {
      await this.patientBlocService.creerDepuisPrescription(saved.id);
    } catch (err) {
      this.logger.error(
        `❌ Échec création PatientBloc depuis la demande CPA externe ${saved.id}: ${(err as Error).message}`,
      );
    }

    // Pousse la même notification temps réel que les prescriptions internes (voir
    // PrescriptionService.ingerer) — sans ça, cette demande n'apparaît que si l'utilisateur
    // ouvre manuellement la page /bloc/notification-cpa (aucune alerte sonore ni badge live).
    // Même échelle que la fiche patient créée juste au-dessus (voir common/urgence.ts) : le
    // seuil local ">= 4" laissait une demande transmise en urgence 3 créer un patient urgent
    // avec une notification et un créneau NON urgents.
    const estUrgent = estNiveauUrgent(niveauDepuisEchelle(dto.urgence));
    await this.notificationBackClient.notifyService({
      serviceId: this.blocServiceId,
      title: estUrgent
        ? '🔴 Demande de CPA externe urgente'
        : '📋 Nouvelle demande de CPA externe',
      message: `${dto.motif || dto.typeAnesthesie} — patient ${dto.patientId} (${dto.sourceServiceName || dto.sourceServiceId})`,
      type: 'new_demande_cpa_externe',
      source: 'bloc-operatoire',
      data: {
        patientId: dto.patientId,
        demandeId: saved.id,
        urgence: dto.urgence,
      },
    });

    return saved;
  }

  // L'identité (nom/prénom) vit dans le service Accueil, jamais dans cette table — le front ne
  // doit jamais afficher patientId à la place (interdit) : sans cet enrichissement, il n'a que
  // l'ID à se mettre sous la dent.
  async findAll(statut?: StatutDemandeCpaExterne, patientId?: string) {
    const where: Record<string, unknown> = {};
    if (statut) where.statut = statut;
    if (patientId) where.patientId = patientId;
    const demandes = await this.repo.find({
      where,
      order: { createdAt: 'DESC' },
    });
    try {
      return await this.accueilClient.enrichWithIdentity(demandes);
    } catch {
      return demandes;
    }
  }

  async findOne(id: string): Promise<DemandeCpaExterne> {
    const demande = await this.repo.findOne({ where: { id } });
    if (!demande)
      throw new NotFoundException(`Demande de CPA externe ${id} non trouvée`);
    try {
      return await this.accueilClient.enrichWithIdentity(demande);
    } catch {
      return demande;
    }
  }

  async update(
    id: string,
    dto: UpdateDemandeCpaDto,
  ): Promise<DemandeCpaExterne> {
    const aujourdhui = new Date().toISOString().split('T')[0];
    for (const champ of ['dateCpaPlanifiee', 'dateVpaPlanifiee'] as const) {
      const valeur = (dto as any)[champ];
      if (valeur && new Date(valeur).toISOString().split('T')[0] < aujourdhui) {
        throw new BadRequestException(
          'Impossible de planifier un rendez-vous à une date passée.',
        );
      }
    }

    const demande = await this.findOne(id);
    Object.assign(demande, {
      ...dto,
      dateCpaPlanifiee: dto.dateCpaPlanifiee
        ? new Date(dto.dateCpaPlanifiee)
        : demande.dateCpaPlanifiee,
      dateVpaPlanifiee: dto.dateVpaPlanifiee
        ? new Date(dto.dateVpaPlanifiee)
        : demande.dateVpaPlanifiee,
    });
    return this.repo.save(demande);
  }

  // Planifie le rendez-vous CPA (ou vérification veille) pour cette demande externe : crée le
  // créneau réel (visible dans /bloc/rendez-vous comme n'importe quel autre RDV) et fait
  // avancer le statut de la demande en conséquence.
  async planifier(
    id: string,
    dto: PlanifierDemandeCpaDto,
  ): Promise<DemandeCpaExterne> {
    const type = dto.type ?? TypeRDV.CPA;
    // Le type est déterminé avant la validation : il conditionne la règle d'unicité d'horaire
    // (une vérification veille peut concerner plusieurs patients au même moment).
    await verifierCreneauValide(
      this.creneauRepo,
      dto.date,
      dto.heureDebut,
      type,
    );

    const demande = await this.findOne(id);

    const creneau = this.creneauRepo.create({
      date: dto.date,
      heureDebut: dto.heureDebut,
      heureFin: dto.heureFin,
      salle: dto.salle,
      patientId: demande.patientId,
      chirurgienId: dto.chirurgienId ?? null,
      responsable: dto.responsable ?? null,
      type,
      estUrgence: estNiveauUrgent(niveauDepuisEchelle(demande.urgence)),
    });
    await this.creneauRepo.save(creneau);

    if (type === TypeRDV.VERIFICATION_VEILLE) {
      demande.statut = StatutDemandeCpaExterne.VPA_PLANIFIEE;
      demande.dateVpaPlanifiee = new Date(dto.date);
    } else {
      demande.statut = StatutDemandeCpaExterne.CPA_PLANIFIEE;
      demande.dateCpaPlanifiee = new Date(dto.date);
    }
    const saved = await this.repo.save(demande);
    // Retire cette demande de la liste "à planifier" sur tous les postes connectés du bloc,
    // sans attendre un rechargement manuel — voir NotificationCPAService.planifierRDV.
    this.notificationBackClient
      .notifyService({
        serviceId: this.blocServiceId,
        title: 'Demande CPA externe planifiée',
        message: `Demande ${id} planifiée`,
        type: 'patient_statut_change',
        source: 'bloc-operatoire',
        data: { demandeId: id, patientId: demande.patientId },
      })
      .catch(() => {});
    return saved;
  }

  // Utilisée par les hooks CPA/VPA : trouve une demande externe encore ouverte pour ce patient.
  async trouverDemandeOuverte(
    patientId: string,
  ): Promise<DemandeCpaExterne | null> {
    return this.repo.findOne({
      where: {
        patientId,
        statut: In([
          StatutDemandeCpaExterne.EN_ATTENTE,
          StatutDemandeCpaExterne.CPA_PLANIFIEE,
          StatutDemandeCpaExterne.VPA_PLANIFIEE,
          StatutDemandeCpaExterne.CPA_REALISEE,
        ]),
      },
      order: { createdAt: 'DESC' },
    });
  }

  // Marque la demande comme vue/écartée dans la cloche de notifications — indépendant du
  // traitement (statut). Voir NotificationCPAService.marquerLu pour l'équivalent interne.
  async marquerLu(id: string): Promise<DemandeCpaExterne> {
    const demande = await this.findOne(id);
    demande.lu = true;
    demande.luLe = new Date();
    return this.repo.save(demande);
  }

  async marquerCpaRealisee(
    demande: DemandeCpaExterne,
    cpaId: string,
    apte: boolean,
  ): Promise<DemandeCpaExterne> {
    // Appelé uniquement pour une décision APTE ou INAPTE (voir CPAService.create, qui exclut
    // explicitement REPORT de cet appel — REPORT passe par un tout autre canal, notifierResultat
    // 'CPA_REPORT', sans jamais toucher `statut`). `apte` ne distingue donc jamais "réalisée" de
    // "à refaire" : INAPTE reste une CPA bel et bien réalisée, pas un report — utiliser REPORTEE
    // ici la confondait avec un vrai report aux yeux de tout service demandeur ne regardant que
    // ce champ. La décision fine (APTE/INAPTE) reste récupérable via cpaId (voir findStatutPublic).
    demande.cpaId = cpaId;
    demande.statut = StatutDemandeCpaExterne.CPA_REALISEE;
    return this.repo.save(demande);
  }

  async marquerVpaRealisee(
    demande: DemandeCpaExterne,
    vpaId: string,
  ): Promise<DemandeCpaExterne> {
    demande.vpaId = vpaId;
    demande.statut = StatutDemandeCpaExterne.CONFIRMEE;
    return this.repo.save(demande);
  }

  // Décision REPORT prise pour un patient non-opératoire (Endoscopie, Urgence, Imagerie) :
  // le dossier est archivé (SORTI), la demande du service est close ici — pas de "tentative à
  // reprendre" dans notre circuit. Appelée par CPAService.create uniquement dans ce cas précis.
  async marquerReportee(
    demande: DemandeCpaExterne,
  ): Promise<DemandeCpaExterne> {
    demande.statut = StatutDemandeCpaExterne.REPORTEE;
    return this.repo.save(demande);
  }

  // Renvoie le résultat de la CPA/VPA au service demandeur. Deux canaux, envoyés
  // systématiquement (pas seulement pour Endoscopie) :
  //  1. Le service Notification, ciblé sur sourceServiceId (toujours fourni à la réception) —
  //     c'est le canal standard de l'écosystème, celui que chaque service écoute déjà en temps
  //     réel (le nôtre y compris). Le demandeur peut aussi interroger GET
  //     /demandes-cpa-externes/:id/statut (public) pour repartir de zéro s'il a manqué l'évènement.
  //  2. sourceCallbackUrl, si le service demandeur en a fourni une (best-effort, en plus).
  async notifierResultat(
    demande: DemandeCpaExterne,
    type: string,
    payload: any,
  ): Promise<void> {
    try {
      await this.notificationBackClient.notifyService({
        serviceId: demande.sourceServiceId,
        title:
          type === 'CPA_RESULTAT'
            ? '✅ Résultat de votre demande de CPA disponible'
            : '✅ Vérification veille réalisée',
        message: `Résultat disponible pour le patient ${demande.patientId} (réf. ${demande.sourceReferenceId})`,
        type:
          type === 'CPA_RESULTAT'
            ? 'demande_cpa_resultat'
            : 'demande_vpa_resultat',
        source: 'bloc-operatoire',
        data: {
          patientId: demande.patientId,
          demandeId: demande.id,
          entiteRefType: demande.sourceReferenceType,
          entiteRefId: demande.sourceReferenceId,
          ...payload,
        },
      });
    } catch (err) {
      this.logger.error(
        `❌ Échec notification temps réel du résultat à ${demande.sourceServiceName || demande.sourceServiceId}: ${(err as Error).message}`,
      );
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
      this.logger.log(
        `✅ Résultat "${type}" renvoyé à ${demande.sourceServiceName || demande.sourceServiceId} pour patient ${demande.patientId}`,
      );
    } catch (err) {
      this.logger.error(
        `❌ Échec envoi résultat "${type}" à ${demande.sourceServiceName || demande.sourceServiceId}: ${(err as Error).message}`,
      );
    }
  }

  // Endpoint public : permet au service demandeur de vérifier l'état de sa demande sans notre
  // jeton SSO (il n'a pas de token scopé sur notre serviceId) — utile en secours de la
  // notification temps réel, ou en poll simple côté service demandeur.
  // Route publique (voir contrôleur) — seul le résultat est exposé ici, jamais le dossier CPA
  // complet (antécédents, allergies, bilan biologique...), qui reste réservé au personnel du
  // bloc. decision/dateCpa/observations ne sont renseignés qu'une fois demande.cpaId posé (voir
  // marquerCpaRealisee, appelé par CPAService.create après la décision APTE/INAPTE/REPORT).
  async findStatutPublic(id: string): Promise<StatutDemandeCpaPubliqueDto> {
    const demande = await this.findOne(id);
    let decision: string | null = null;
    let dateCpa: Date | null = null;
    let observations: string | null = null;
    // Le motif n'a de sens que pour INAPTE/REPORT (voir CPAService.create, qui l'exige dans ces
    // deux cas) — c'est justement l'information la plus utile à transmettre au demandeur quand
    // ce n'est pas APTE, donc jamais omise ici.
    let motifRefus: string | null = null;
    if (demande.cpaId) {
      const cpa = await this.cpaRepo.findOne({ where: { id: demande.cpaId } });
      if (cpa) {
        decision = cpa.decision;
        dateCpa = cpa.dateConsultation;
        observations = cpa.notesIncidents || null;
        motifRefus = cpa.motifRefus || null;
      }
    }
    return {
      id: demande.id,
      patientId: demande.patientId,
      sourceReferenceId: demande.sourceReferenceId,
      statut: demande.statut,
      cpaId: demande.cpaId || null,
      vpaId: demande.vpaId || null,
      dateCpaPlanifiee: demande.dateCpaPlanifiee || null,
      dateVpaPlanifiee: demande.dateVpaPlanifiee || null,
      decision,
      dateCpa,
      observations,
      motifRefus,
    };
  }
}
