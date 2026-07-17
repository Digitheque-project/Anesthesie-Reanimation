import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CPA, DecisionCPA } from '../entities/cpa.entity';
import { PatientBloc, PatientStatut } from '../entities/patient-bloc.entity';
import { Premedicament } from '../entities/premedicament.entity';
import { AccueilClient } from '../external/accueil.client';
import { EndoscopieClient } from '../external/endoscopie.client';
import { NotificationOutgoingService } from '../external/notification-outgoing.service';
import { DemandeCpaExterneService } from '../demande-cpa-externe/demande-cpa-externe.service';
import { MedecinService } from '../medecin/medecin.service';
import { CentralUser } from '../central-auth/central-user.interface';
import { matchRoleClinique, RoleClinique } from '../central-auth/role-clinique';
import { Medecin, RoleMedecin } from '../entities/medecin.entity';
import { CreateCPADto } from './dto/create-cpa.dto';
import { UpdateCPADto } from './dto/update-cpa.dto';

@Injectable()
export class CPAService {
  private readonly logger = new Logger(CPAService.name);

  constructor(
    @InjectRepository(CPA) private cpaRepository: Repository<CPA>,
    @InjectRepository(PatientBloc) private patientBlocRepo: Repository<PatientBloc>,
    @InjectRepository(Premedicament) private premedRepository: Repository<Premedicament>,
    private accueilClient: AccueilClient,
    private endoscopieClient: EndoscopieClient,
    private notificationOutgoing: NotificationOutgoingService,
    private demandeCpaExterneService: DemandeCpaExterneService,
    private medecinService: MedecinService,
  ) {}

  async create(dto: CreateCPADto, centralUser: CentralUser): Promise<CPA> {
    if (
      (dto.decision === DecisionCPA.INAPTE || dto.decision === DecisionCPA.REPORT) &&
      (!dto.motifRefus || dto.motifRefus.trim() === '')
    ) {
      throw new BadRequestException(
        dto.decision === DecisionCPA.INAPTE
          ? 'Le motif du refus est obligatoire lorsque la décision est INAPTE.'
          : "Le motif du report est obligatoire lorsque la décision est REPORT.",
      );
    }

    // Si c'est l'anesthésiste lui-même qui est connecté, il est toujours celui qui a réalisé la
    // CPA — jamais une saisie manuelle du client. Sa fiche Médecin doit exister (créée par un
    // administrateur) avec le même email que son compte SSO. Si c'est un Responsable CPA ou un
    // Major qui saisit la CPA (traitement administratif au nom de l'anesthésiste), ces rôles
    // n'ont pas de fiche Médecin propre : l'anesthésiste ayant réalisé l'examen doit être
    // désigné explicitement dans le formulaire.
    const roleUtilisateur = matchRoleClinique(centralUser.role);
    let anesthesiste: Medecin;

    if (roleUtilisateur === RoleClinique.ANESTHESISTE) {
      const trouve = await this.medecinService.findByEmail(centralUser.email);
      if (!trouve) {
        throw new BadRequestException(
          `Aucune fiche Médecin ne correspond à votre compte (${centralUser.email}). Contactez un administrateur pour la créer.`,
        );
      }
      anesthesiste = trouve;
    } else {
      if (!dto.anesthesisteId) {
        throw new BadRequestException("L'anesthésiste ayant réalisé la consultation doit être sélectionné.");
      }
      anesthesiste = await this.medecinService.findOne(dto.anesthesisteId);
      if (anesthesiste.role !== RoleMedecin.ANESTHESISTE) {
        throw new BadRequestException(`${anesthesiste.prenom} ${anesthesiste.nom} n'est pas enregistré(e) comme anesthésiste.`);
      }
    }

    const { premedicaments, anesthesisteId: _ignored, ...cpaData } = dto as any;
    const cpa = this.cpaRepository.create({ ...cpaData, anesthesisteId: anesthesiste.id });
    const savedCPA = await this.cpaRepository.save(cpa);
    const saved = Array.isArray(savedCPA) ? savedCPA[0] : savedCPA;

    if (premedicaments?.length) {
      const premeds = premedicaments.map((p: any) => this.premedRepository.create({ ...p, cpa: saved }));
      await this.premedRepository.save(premeds);
    }

    if (dto.patientId) {
      // REPORT = consultation faite mais décision remise à plus tard : le patient retourne
      // en attente de CPA, ce n'est ni une aptitude ni une inaptitude définitive.
      const nouveauStatut = dto.decision === DecisionCPA.INAPTE
        ? PatientStatut.CPA_INAPTE
        : dto.decision === DecisionCPA.REPORT
          ? PatientStatut.EN_ATTENTE_CPA
          : PatientStatut.CPA_REALISE;

      await this.patientBlocRepo.update(dto.patientId, { statut: nouveauStatut });

      if (dto.decision !== DecisionCPA.REPORT) {
        const demande = await this.demandeCpaExterneService.trouverDemandeOuverte(dto.patientId);
        if (demande) {
          const apte = saved.decision === DecisionCPA.APTE;
          await this.demandeCpaExterneService.marquerCpaRealisee(demande, saved.id, apte);
          try {
            if (demande.sourceCallbackUrl) {
              // Service externe générique (a fourni son URL de rappel à la réception).
              await this.demandeCpaExterneService.notifierResultat(demande, 'CPA_RESULTAT', {
                decision: saved.decision,
                dateCpa: saved.dateConsultation,
                observations: saved.notesIncidents,
              });
            } else {
              // Intégration historique Endoscopie (n'a jamais fourni d'URL de rappel explicite).
              await this.endoscopieClient.notifyCpaResultat(demande, saved.decision, {
                dateCpa: saved.dateConsultation,
                observations: saved.notesIncidents,
              });
            }
          } catch (err) {
            this.logger.error(`Erreur notification résultat CPA au service demandeur: ${(err as Error).message}`);
          }
        }
      }

      try {
        const patient = await this.patientBlocRepo.findOne({ where: { patientId: dto.patientId } });
        if (patient?.serviceOrigineId && patient?.serviceOrigine) {
          await this.notificationOutgoing.notifyOriginService({
            patientId: dto.patientId,
            type: dto.decision === DecisionCPA.INAPTE ? 'CPA_INAPTE' : dto.decision === DecisionCPA.REPORT ? 'CPA_REPORT' : 'CPA_APTE',
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
        this.logger.error(`Erreur notification service origine: ${(err as Error).message}`);
      }
    }

    return this.findOne(saved.id);
  }

  async findAll(page = 1, limite = 10, patientId?: string) {
    const [data, total] = await this.cpaRepository.findAndCount({
      where: patientId ? { patientId } : {},
      relations: ['anesthesiste', 'premedicaments'],
      skip: (page - 1) * limite, take: limite, order: { createdAt: 'DESC' }
    });
    const enriched = await this.accueilClient.enrichWithIdentity(data);
    return { data: enriched, total, page, pages: Math.ceil(total / limite) };
  }

  async findOne(id: string): Promise<any> {
    const cpa = await this.cpaRepository.findOne({ where: { id }, relations: ['anesthesiste', 'premedicaments'] });
    if (!cpa) throw new NotFoundException(`CPA ${id} non trouvée`);
    const [enriched] = await this.accueilClient.enrichWithIdentity([cpa]);
    return enriched;
  }

  async update(id: string, dto: UpdateCPADto): Promise<CPA> {
    const cpa = await this.cpaRepository.findOne({ where: { id } });
    if (!cpa) throw new NotFoundException(`CPA ${id} non trouvée`);
    Object.assign(cpa, dto);
    return this.cpaRepository.save(cpa);
  }

  async remove(id: string): Promise<{ message: string }> {
    const cpa = await this.cpaRepository.findOne({ where: { id } });
    if (!cpa) throw new NotFoundException(`CPA ${id} non trouvée`);
    await this.cpaRepository.delete(id);
    return { message: 'CPA supprimée' };
  }
}
