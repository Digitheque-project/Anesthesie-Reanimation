import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationVeille } from '../entities/verification-veille.entity';
import { CPA } from '../entities/cpa.entity';
import { PatientBloc, PatientStatut } from '../entities/patient-bloc.entity';
import { AccueilClient } from '../external/accueil.client';
import { EndoscopieClient } from '../external/endoscopie.client';
import { MedecinIdentiteService } from '../medecin/medecin-identite.service';
import { DemandeCpaExterneService } from '../demande-cpa-externe/demande-cpa-externe.service';
import { PatientBlocStatutService } from '../patient-bloc/patient-bloc-statut.service';
import { CreateVerificationVeilleDto } from './dto/create-verification-veille.dto';
import { UpdateVerificationVeilleDto } from './dto/update-verification-veille.dto';

@Injectable()
export class VerificationVeilleService {
  private readonly logger = new Logger(VerificationVeilleService.name);

  constructor(
    @InjectRepository(VerificationVeille)
    private repo: Repository<VerificationVeille>,
    @InjectRepository(PatientBloc)
    private patientBlocRepo: Repository<PatientBloc>,
    @InjectRepository(CPA) private cpaRepo: Repository<CPA>,
    private accueilClient: AccueilClient,
    private endoscopieClient: EndoscopieClient,
    private medecinIdentiteService: MedecinIdentiteService,
    private demandeCpaExterneService: DemandeCpaExterneService,
    private patientBlocStatutService: PatientBlocStatutService,
  ) {}

  async create(dto: CreateVerificationVeilleDto): Promise<VerificationVeille> {
    // La vérification à la veille suit toujours une CPA réelle : les patients urgents n'ont pas
    // de "veille" (chirurgie immédiate) et passent par l'interface de CPA elle-même, étiquetée
    // VPA pour eux — voir CPAModule.
    const cpa = await this.cpaRepo.findOne({
      where: { id: dto.cpaId, patientId: dto.patientId },
    });
    if (!cpa) {
      throw new BadRequestException(
        "La CPA indiquée n'existe pas pour ce patient.",
      );
    }

    const savedResult = await this.repo.save(this.repo.create(dto as any));
    const saved = Array.isArray(savedResult) ? savedResult[0] : savedResult;

    await this.patientBlocRepo.update(dto.patientId, {
      statut: PatientStatut.VERIFICATION_VEILLE_REALISEE,
    });

    // Rien d'autre ne faisait jamais avancer le patient vers PRET_POUR_BLOC : il restait
    // invisible sur l'écran "Programme opératoire" le jour de l'intervention, sans aucun moyen
    // de "démarrer" son opération (checklist Sign In). La vérification veille réalisée marque
    // dans les faits que le patient est prêt pour le bloc.
    try {
      await this.patientBlocStatutService.changerStatut(
        dto.patientId,
        PatientStatut.PRET_POUR_BLOC,
      );
    } catch (err) {
      this.logger.warn(
        `Transition PRET_POUR_BLOC impossible pour ${dto.patientId}: ${(err as Error).message}`,
      );
    }

    // Si une demande de CPA/VPA externe est ouverte pour ce patient, la confirmer et renvoyer
    // le résultat au service demandeur (URL de rappel générique, ou repli Endoscopie historique).
    const demande = await this.demandeCpaExterneService.trouverDemandeOuverte(
      dto.patientId,
    );
    if (demande) {
      await this.demandeCpaExterneService.marquerVpaRealisee(demande, saved.id);
      await this.demandeCpaExterneService.notifierResultat(
        demande,
        'VPA_REALISEE',
        { dateVpa: saved.dateVisite },
      );
      if (!demande.sourceCallbackUrl) {
        await this.endoscopieClient.notifyVpaRealisee(demande, {
          dateVpa: saved.dateVisite,
        });
      }
    }

    return saved;
  }

  async findAll(page = 1, limite = 10) {
    const [data, total] = await this.repo.findAndCount({
      relations: ['cpa'],
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
    const verif = await this.repo.findOne({
      where: { id },
      relations: ['cpa'],
    });
    if (!verif)
      throw new NotFoundException(`Vérification veille ${id} non trouvée`);
    const [enrichedPatient] = await this.accueilClient.enrichWithIdentity([
      verif,
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
    dto: UpdateVerificationVeilleDto,
  ): Promise<VerificationVeille> {
    const verif = await this.repo.findOne({ where: { id } });
    if (!verif)
      throw new NotFoundException(`Vérification veille ${id} non trouvée`);
    return this.repo.save(Object.assign(verif, dto));
  }

  async remove(id: string): Promise<{ message: string }> {
    const verif = await this.repo.findOne({ where: { id } });
    if (!verif)
      throw new NotFoundException(`Vérification veille ${id} non trouvée`);
    await this.repo.delete(id);
    return { message: 'Vérification veille supprimée' };
  }
}
