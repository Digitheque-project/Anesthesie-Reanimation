import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CPA, DecisionCPA, StatutValidationProf } from '../entities/cpa.entity';
import {
  PatientBloc,
  PatientStatut,
  NiveauUrgence,
} from '../entities/patient-bloc.entity';
import {
  NotificationCPA,
  StatutNotificationCPA,
} from '../entities/notification-cpa.entity';
import { Premedicament } from '../entities/premedicament.entity';
import { AccueilClient } from '../external/accueil.client';
import { EndoscopieClient } from '../external/endoscopie.client';
import { NotificationOutgoingService } from '../external/notification-outgoing.service';
import { DemandeCpaExterneService } from '../demande-cpa-externe/demande-cpa-externe.service';
import { MedecinService } from '../medecin/medecin.service';
import { MedecinIdentiteService } from '../medecin/medecin-identite.service';
import { PatientBlocStatutService } from '../patient-bloc/patient-bloc-statut.service';
import { CentralUser } from '../central-auth/central-user.interface';
import { matchRoleClinique, RoleClinique } from '../central-auth/role-clinique';
import { RoleMedecin } from '../entities/medecin.entity';
import { TracabiliteService } from '../tracabilite/tracabilite.service';
import { CreateCPADto } from './dto/create-cpa.dto';
import { UpdateCPADto } from './dto/update-cpa.dto';

@Injectable()
export class CPAService {
  private readonly logger = new Logger(CPAService.name);

  constructor(
    @InjectRepository(CPA) private cpaRepository: Repository<CPA>,
    @InjectRepository(PatientBloc)
    private patientBlocRepo: Repository<PatientBloc>,
    @InjectRepository(Premedicament)
    private premedRepository: Repository<Premedicament>,
    @InjectRepository(NotificationCPA)
    private notificationCpaRepo: Repository<NotificationCPA>,
    private accueilClient: AccueilClient,
    private endoscopieClient: EndoscopieClient,
    private notificationOutgoing: NotificationOutgoingService,
    private demandeCpaExterneService: DemandeCpaExterneService,
    private medecinService: MedecinService,
    private medecinIdentiteService: MedecinIdentiteService,
    private tracabiliteService: TracabiliteService,
    private patientBlocStatutService: PatientBlocStatutService,
  ) {}

  async create(dto: CreateCPADto, centralUser: CentralUser): Promise<CPA> {
    if (
      (dto.decision === DecisionCPA.INAPTE ||
        dto.decision === DecisionCPA.REPORT) &&
      (!dto.motifRefus || dto.motifRefus.trim() === '')
    ) {
      throw new BadRequestException(
        dto.decision === DecisionCPA.INAPTE
          ? 'Le motif du refus est obligatoire lorsque la décision est INAPTE.'
          : 'Le motif du report est obligatoire lorsque la décision est REPORT.',
      );
    }

    // Si c'est l'anesthésiste lui-même qui est connecté, il est toujours celui qui a réalisé la
    // CPA — jamais une saisie manuelle du client. Son identité SSO (userId central) sert
    // directement de référence, sans exiger de fiche Médecin locale préalable. Si c'est un
    // Responsable CPA ou un Major qui saisit la CPA (traitement administratif au nom de
    // l'anesthésiste), ces rôles n'ont pas d'identité anesthésiste propre : l'anesthésiste
    // ayant réalisé l'examen doit être désigné explicitement dans le formulaire, via la table
    // locale `medecins` (traitée comme un médecin externe par convention).
    const roleUtilisateur = matchRoleClinique(centralUser.role);
    let anesthesisteId: string | null;

    if (roleUtilisateur === RoleClinique.ANESTHESISTE) {
      anesthesisteId = centralUser.userId;
    } else if (dto.anesthesisteId) {
      // Désignation facultative : la liste (table locale `medecins`) peut être vide si aucun
      // anesthésiste externe n'y a été enregistré — ne bloque plus la création de la CPA.
      const anesthesiste = await this.medecinService.findOne(
        dto.anesthesisteId,
      );
      if (anesthesiste.role !== RoleMedecin.ANESTHESISTE) {
        throw new BadRequestException(
          `${anesthesiste.prenom} ${anesthesiste.nom} n'est pas enregistré(e) comme anesthésiste.`,
        );
      }
      anesthesisteId = anesthesiste.id;
    } else {
      anesthesisteId = null;
    }

    // Anesthésiste ou Major (qui cumule les deux rôles, voir StatutValidationProf) réalisant la
    // CPA seul : sa décision engage sa propre responsabilité, ce qui vaut validation immédiate.
    // Un Responsable CPA seul (sans Major) doit encore passer la main à un anesthésiste pour les
    // médicaments et la vérification veille — tant que ce n'est pas fait, en attente.
    const statutValidationProf =
      roleUtilisateur === RoleClinique.ANESTHESISTE ||
      roleUtilisateur === RoleClinique.MAJOR
        ? StatutValidationProf.VALIDE
        : StatutValidationProf.EN_ATTENTE_VALIDATION;

    const { premedicaments, anesthesisteId: _ignored, ...cpaData } = dto as any;
    const cpa = this.cpaRepository.create({
      ...cpaData,
      anesthesisteId,
      statutValidationProf,
      saisiParId: centralUser.userId,
      saisiParRole: centralUser.role,
    });
    const savedCPA = await this.cpaRepository.save(cpa);
    const saved = Array.isArray(savedCPA) ? savedCPA[0] : savedCPA;

    if (premedicaments?.length) {
      const premeds = premedicaments.map((p: any) =>
        this.premedRepository.create({ ...p, cpa: saved }),
      );
      await this.premedRepository.save(premeds);
    }

    if (dto.patientId) {
      // REPORT = consultation faite mais décision remise à plus tard : le patient reste
      // EN_ATTENTE_CPA — ce n'est pas une transition réelle (changerStatut rejetterait un
      // "changement" vers l'état déjà courant), donc aucun appel de transition dans ce cas.
      const nouveauStatut =
        dto.decision === DecisionCPA.INAPTE
          ? PatientStatut.CPA_INAPTE
          : dto.decision === DecisionCPA.REPORT
            ? null
            : PatientStatut.CPA_REALISE;

      if (nouveauStatut) {
        await this.patientBlocStatutService.changerStatut(
          dto.patientId,
          nouveauStatut,
          centralUser.userId,
        );
      }

      // Une décision APTE/INAPTE ferme réellement le dossier de prescription : la notification
      // CPA correspondante ne doit plus apparaître dans le fil "Prescription" (EN_ATTENTE), qu'un
      // RDV ait été planifié via ce fil ou non (cas patient urgent en VPA directe, ou CPA réalisée
      // en accédant au dossier patient sans passer par la planification) — sans cette bascule, ces
      // patients pourtant déjà traités restaient indéfiniment visibles comme "en attente".
      // REPORT est exclu : la CPA elle-même reste à refaire, le patient doit rester actionnable.
      if (dto.decision !== DecisionCPA.REPORT) {
        await this.notificationCpaRepo.update(
          {
            patientId: dto.patientId,
            statut: In([
              StatutNotificationCPA.EN_ATTENTE,
              StatutNotificationCPA.RDV_PLANIFIE,
            ]),
          },
          { statut: StatutNotificationCPA.REALISE },
        );
      } else {
        // REPORT = consultation faite, décision remise à plus tard : la notification reste
        // EN_ATTENTE (la CPA est à refaire, les statistiques ne doivent pas la perdre), mais on la
        // marque "lue" pour qu'elle ne trône plus en tête du fil "Prescription" — même mécanique
        // que la cloche, où un élément lu disparaît de la liste des actions à traiter.
        await this.notificationCpaRepo.update(
          {
            patientId: dto.patientId,
            statut: StatutNotificationCPA.EN_ATTENTE,
            lu: false,
          },
          { lu: true, luLe: new Date() },
        );
      }

      // Recherché pour REPORT aussi : le service demandeur doit être notifié que la CPA est
      // reportée (à refaire), pas seulement quand elle est finalisée (APTE/INAPTE) — voir plus
      // bas, où seul le cas REPORT évite marquerCpaRealisee (la demande externe n'est pas close).
      const demande = await this.demandeCpaExterneService.trouverDemandeOuverte(
        dto.patientId,
      );

      // Patient urgent/très urgent déclaré APTE : pas de "vérification la veille" à attendre,
      // l'opération (ou l'acte réalisé avec l'anesthésiste du Bloc) peut avoir lieu le jour même —
      // bascule directe vers PRET_POUR_BLOC pour qu'il apparaisse immédiatement dans la liste des
      // patients programmés du jour. S'applique aussi aux patients venus par demande de CPA
      // externe (Endoscopie, Imagerie, Urgence...) : ils atterrissent alors dans le Programme
      // non-opératoire (jamais dans le Programme opératoire — voir la distinction par
      // serviceOrigine dans patient-bloc.service.ts), pas dans le programme du Bloc lui-même.
      // Un patient non urgent, lui, reste à CPA_REALISE jusqu'à la vérification veille (même
      // écran, même mécanique, que la demande soit externe ou non — voir VerificationVeilleService).
      if (nouveauStatut === PatientStatut.CPA_REALISE) {
        const patientApresCpa = await this.patientBlocRepo.findOne({
          where: { patientId: dto.patientId },
        });
        if (
          patientApresCpa?.niveauUrgence === NiveauUrgence.URGENT ||
          patientApresCpa?.niveauUrgence === NiveauUrgence.TRES_URGENT
        ) {
          await this.patientBlocStatutService.changerStatut(
            dto.patientId,
            PatientStatut.PRET_POUR_BLOC,
            centralUser.userId,
          );
        } else if (
          // L'anesthésiste (ou le Major qui cumule les deux rôles) réalisant seul sa propre CPA
          // a déjà complété les médicaments d'anesthésie dans la foulée : inutile de le renvoyer
          // vers l'étape "Vérifier médicament" du Fil de travail — le patient bascule
          // directement dans la liste Vérification veille (CPA_REALISE → EN_ATTENTE_VERIFICATION_VEILLE).
          statutValidationProf === StatutValidationProf.VALIDE &&
          Array.isArray(dto.medicamentsAnesthesieReanimation) &&
          dto.medicamentsAnesthesieReanimation.length > 0
        ) {
          await this.patientBlocStatutService.changerStatut(
            dto.patientId,
            PatientStatut.EN_ATTENTE_VERIFICATION_VEILLE,
            centralUser.userId,
          );
        }
      }

      if (demande && dto.decision !== DecisionCPA.REPORT) {
        const apte = saved.decision === DecisionCPA.APTE;
        await this.demandeCpaExterneService.marquerCpaRealisee(
          demande,
          saved.id,
          apte,
        );
        try {
          // Canal standard (service Notification, + sourceCallbackUrl si fournie) — toujours
          // envoyé, quel que soit le service demandeur.
          await this.demandeCpaExterneService.notifierResultat(
            demande,
            'CPA_RESULTAT',
            {
              decision: saved.decision,
              decisionOperation: saved.decisionOperation,
              dateCpa: saved.dateConsultation,
              observations: saved.notesIncidents,
              motifRefus: saved.motifRefus,
            },
          );
          if (!demande.sourceCallbackUrl) {
            // Intégration historique Endoscopie, en plus (n'a jamais fourni d'URL de rappel).
            await this.endoscopieClient.notifyCpaResultat(
              demande,
              saved.decision,
              {
                dateCpa: saved.dateConsultation,
                observations: saved.notesIncidents,
              },
            );
          }
        } catch (err) {
          this.logger.error(
            `Erreur notification résultat CPA au service demandeur: ${(err as Error).message}`,
          );
        }
      } else if (demande && dto.decision === DecisionCPA.REPORT) {
        // La CPA elle-même est reportée (à refaire) — la demande externe reste ouverte (pas de
        // marquerCpaRealisee), mais le service demandeur doit tout de même être averti plutôt que
        // de rester sans nouvelles jusqu'à la prochaine tentative.
        try {
          await this.demandeCpaExterneService.notifierResultat(
            demande,
            'CPA_REPORT',
            {
              motifRefus: saved.motifRefus,
              dateReport: saved.dateVerificationVeille,
            },
          );
        } catch (err) {
          this.logger.error(
            `Erreur notification report CPA au service demandeur: ${(err as Error).message}`,
          );
        }
      }

      try {
        const patient = await this.patientBlocRepo.findOne({
          where: { patientId: dto.patientId },
        });
        // Identifiant suffisant : le nom du service (résolution best-effort) n'est qu'un libellé
        // d'affichage — voir NotificationOutgoingService.notifyOriginService.
        if (patient?.serviceOrigineId) {
          await this.notificationOutgoing.notifyOriginService({
            patientId: dto.patientId,
            type:
              dto.decision === DecisionCPA.INAPTE
                ? 'CPA_INAPTE'
                : dto.decision === DecisionCPA.REPORT
                  ? 'CPA_REPORT'
                  : 'CPA_APTE',
            serviceOrigineId: patient.serviceOrigineId,
            serviceOrigineName: patient.serviceOrigine,
            payload: {
              decision: saved.decision,
              motifRefus: saved.motifRefus || null,
              dateCpa: saved.dateConsultation,
              scoreASA: saved.scoreASA,
            },
          });
        }
      } catch (err) {
        this.logger.error(
          `Erreur notification service origine: ${(err as Error).message}`,
        );
      }
    }

    await this.tracabiliteService.log(
      'CPA',
      saved.id,
      'CREATE',
      { patientId: dto.patientId, decision: dto.decision },
      centralUser.userId,
    );

    return this.findOne(saved.id);
  }

  async findAll(page = 1, limite = 10, patientId?: string) {
    const [data, total] = await this.cpaRepository.findAndCount({
      where: patientId ? { patientId } : {},
      relations: ['premedicaments'],
      skip: (page - 1) * limite,
      take: limite,
      order: { createdAt: 'DESC' },
    });
    const enrichedPatient = await this.accueilClient.enrichWithIdentity(data);
    const enriched = await this.medecinIdentiteService.enrichir(
      enrichedPatient,
      'anesthesisteId',
      'anesthesiste',
    );
    return { data: enriched, total, page, pages: Math.ceil(total / limite) };
  }

  async findOne(id: string): Promise<any> {
    const cpa = await this.cpaRepository.findOne({
      where: { id },
      relations: ['premedicaments'],
    });
    if (!cpa) throw new NotFoundException(`CPA ${id} non trouvée`);
    const [enrichedPatient] = await this.accueilClient.enrichWithIdentity([
      cpa,
    ]);
    const [enriched] = await this.medecinIdentiteService.enrichir(
      [enrichedPatient],
      'anesthesisteId',
      'anesthesiste',
    );
    return enriched;
  }

  async update(
    id: string,
    dto: UpdateCPADto,
    centralUser?: CentralUser,
  ): Promise<CPA> {
    const cpa = await this.cpaRepository.findOne({ where: { id } });
    if (!cpa) throw new NotFoundException(`CPA ${id} non trouvée`);
    Object.assign(cpa, dto);

    // Le Responsable CPA seul (sans Major) avait posé la décision sans encore passer par
    // l'anesthésiste (médicaments + vérification veille) — cette mise à jour EST ce passage : la
    // boucle est bouclée, la CPA devient validée. Pour une décision APTE, on exige que ce
    // contenu soit réellement fourni (pas juste n'importe quelle mise à jour du même rôle) ;
    // pour INAPTE/REPORT, ces deux champs sont sans objet (voir consultation-cpa/page.tsx, qui ne
    // les envoie jamais hors APTE) donc le simple passage de l'anesthésiste/major suffit.
    const roleUtilisateur = centralUser
      ? matchRoleClinique(centralUser.role)
      : null;
    const contientSuiviAnesthesiste =
      (dto as any).medicamentsAnesthesieReanimation !== undefined ||
      (dto as any).dateVerificationVeille !== undefined;
    if (
      cpa.statutValidationProf === StatutValidationProf.EN_ATTENTE_VALIDATION &&
      (roleUtilisateur === RoleClinique.ANESTHESISTE ||
        roleUtilisateur === RoleClinique.MAJOR) &&
      (cpa.decision !== DecisionCPA.APTE || contientSuiviAnesthesiste)
    ) {
      cpa.statutValidationProf = StatutValidationProf.VALIDE;
    }

    // Deuxième étape du flux CPA : l'anesthésiste (ou le Major) vient de compléter les
    // médicaments d'anesthésie/réanimation et la date de vérification veille d'une CPA posée par
    // le Responsable CPA. Le patient a alors franchi l'étape "Vérifier médicament" du Fil de
    // travail : il bascule automatiquement dans la liste Vérification veille
    // (CPA_REALISE → EN_ATTENTE_VERIFICATION_VEILLE), même si la date d'intervention a été
    // reportée pendant la CPA. Vérifie l'état courant du patient (non urgent déclaré APTE =
    // statut CPA_REALISE) : idempotent, ne re-bascule jamais un patient déjà en veille, et sans
    // effet pour INAPTE (CPA_INAPTE) ou REPORT (resté EN_ATTENTE_CPA).
    const patientApresCpa = cpa.patientId
      ? await this.patientBlocRepo.findOne({
          where: { patientId: cpa.patientId },
        })
      : null;
    if (
      patientApresCpa?.statut === PatientStatut.CPA_REALISE &&
      cpa.decision === DecisionCPA.APTE &&
      (roleUtilisateur === RoleClinique.ANESTHESISTE ||
        roleUtilisateur === RoleClinique.MAJOR) &&
      contientSuiviAnesthesiste
    ) {
      await this.patientBlocStatutService.changerStatut(
        cpa.patientId,
        PatientStatut.EN_ATTENTE_VERIFICATION_VEILLE,
        centralUser?.userId,
      );
    }

    const updated = await this.cpaRepository.save(cpa);
    await this.tracabiliteService.log(
      'CPA',
      id,
      'UPDATE',
      { patientId: cpa.patientId },
      centralUser?.userId,
    );
    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const cpa = await this.cpaRepository.findOne({ where: { id } });
    if (!cpa) throw new NotFoundException(`CPA ${id} non trouvée`);
    await this.cpaRepository.delete(id);
    return { message: 'CPA supprimée' };
  }
}
