import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationVeille } from '../entities/verification-veille.entity';
import { CPA } from '../entities/cpa.entity';
import { PatientBloc, PatientStatut } from '../entities/patient-bloc.entity';
import { AccueilClient } from '../external/accueil.client';
import { EndoscopieClient } from '../external/endoscopie.client';
import { DemandeCpaExterneService } from '../demande-cpa-externe/demande-cpa-externe.service';
import { CreateVerificationVeilleDto } from './dto/create-verification-veille.dto';
import { UpdateVerificationVeilleDto } from './dto/update-verification-veille.dto';

@Injectable()
export class VerificationVeilleService {
  constructor(
    @InjectRepository(VerificationVeille) private repo: Repository<VerificationVeille>,
    @InjectRepository(PatientBloc) private patientBlocRepo: Repository<PatientBloc>,
    @InjectRepository(CPA) private cpaRepo: Repository<CPA>,
    private accueilClient: AccueilClient,
    private endoscopieClient: EndoscopieClient,
    private demandeCpaExterneService: DemandeCpaExterneService,
  ) {}

  async create(dto: CreateVerificationVeilleDto): Promise<VerificationVeille> {
    // La vérification à la veille suit toujours une CPA réelle : les patients urgents n'ont pas
    // de "veille" (chirurgie immédiate) et passent par l'interface de CPA elle-même, étiquetée
    // VPA pour eux — voir CPAModule.
    const cpa = await this.cpaRepo.findOne({ where: { id: dto.cpaId, patientId: dto.patientId } });
    if (!cpa) {
      throw new BadRequestException("La CPA indiquée n'existe pas pour ce patient.");
    }

    const savedResult = await this.repo.save(this.repo.create(dto as any));
    const saved = Array.isArray(savedResult) ? savedResult[0] : savedResult;

    await this.patientBlocRepo.update(dto.patientId, { statut: PatientStatut.VERIFICATION_VEILLE_REALISEE });

    // Si une demande de CPA/VPA externe (ex: Endoscopie) est ouverte pour ce patient, la confirmer.
    const demande = await this.demandeCpaExterneService.trouverDemandeOuverte(dto.patientId);
    if (demande) {
      await this.demandeCpaExterneService.marquerVpaRealisee(demande, saved.id);
      await this.endoscopieClient.notifyVpaRealisee(demande, { dateVpa: saved.dateVisite });
    }

    return saved;
  }

  async findAll(page = 1, limite = 10) {
    const [data, total] = await this.repo.findAndCount({
      relations: ['cpa', 'anesthesiste'],
      skip: (page - 1) * limite, take: limite, order: { createdAt: 'DESC' }
    });
    const enriched = await this.accueilClient.enrichWithIdentity(data);
    return { data: enriched, total, page, pages: Math.ceil(total / limite) };
  }

  async findOne(id: string): Promise<any> {
    const verif = await this.repo.findOne({ where: { id }, relations: ['cpa', 'anesthesiste'] });
    if (!verif) throw new NotFoundException(`Vérification veille ${id} non trouvée`);
    const [enriched] = await this.accueilClient.enrichWithIdentity([verif]);
    return enriched;
  }

  async update(id: string, dto: UpdateVerificationVeilleDto): Promise<VerificationVeille> {
    const verif = await this.repo.findOne({ where: { id } });
    if (!verif) throw new NotFoundException(`Vérification veille ${id} non trouvée`);
    return this.repo.save(Object.assign(verif, dto));
  }

  async remove(id: string): Promise<{ message: string }> {
    const verif = await this.repo.findOne({ where: { id } });
    if (!verif) throw new NotFoundException(`Vérification veille ${id} non trouvée`);
    await this.repo.delete(id);
    return { message: 'Vérification veille supprimée' };
  }
}
