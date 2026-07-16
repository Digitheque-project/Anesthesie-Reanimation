import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VPA } from '../entities/vpa.entity';
import { CPA } from '../entities/cpa.entity';
import { PatientBloc, PatientStatut } from '../entities/patient-bloc.entity';
import { AccueilClient } from '../external/accueil.client';
import { EndoscopieClient } from '../external/endoscopie.client';
import { DemandeCpaExterneService } from '../demande-cpa-externe/demande-cpa-externe.service';
import { CreateVPADto } from './dto/create-vpa.dto';
import { UpdateVPADto } from './dto/update-vpa.dto';

@Injectable()
export class VPAService {
  constructor(
    @InjectRepository(VPA) private repo: Repository<VPA>,
    @InjectRepository(PatientBloc) private patientBlocRepo: Repository<PatientBloc>,
    @InjectRepository(CPA) private cpaRepo: Repository<CPA>,
    private accueilClient: AccueilClient,
    private endoscopieClient: EndoscopieClient,
    private demandeCpaExterneService: DemandeCpaExterneService,
  ) {}

  async create(dto: CreateVPADto): Promise<VPA> {
    if (dto.patientId) {
      const patient = await this.patientBlocRepo.findOne({ where: { patientId: dto.patientId } });

      if (patient) {
        const estPatientUrgent = patient.niveauUrgence === 'STAT' || patient.niveauUrgence === 'URGENT';

        if (!estPatientUrgent && !dto.cpaId) {
          throw new BadRequestException('CPA required before VPA for a normal patient.');
        }

        if (dto.cpaId) {
          const cpa = await this.cpaRepo.findOne({ where: { id: dto.cpaId, patientId: dto.patientId } });
          if (!cpa) {
            throw new BadRequestException('The specified CPA does not belong to this patient.');
          }
        }
      }
    }

    const savedResult = await this.repo.save(this.repo.create(dto as any));
    const saved = Array.isArray(savedResult) ? savedResult[0] : savedResult;

    // Mettre à jour le statut du patient
    if (dto.patientId) {
      await this.patientBlocRepo.update(dto.patientId, { statut: PatientStatut.VPA_REALISE });

      // Si une demande de CPA/VPA externe (ex: Endoscopie) est ouverte pour ce patient, la confirmer.
      const demande = await this.demandeCpaExterneService.trouverDemandeOuverte(dto.patientId);
      if (demande) {
        await this.demandeCpaExterneService.marquerVpaRealisee(demande, saved.id);
        await this.endoscopieClient.notifyVpaRealisee(demande, { dateVpa: saved.dateVisite });
      }
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
    const vpa = await this.repo.findOne({ where: { id }, relations: ['cpa', 'anesthesiste'] });
    if (!vpa) throw new NotFoundException(`VPA ${id} non trouvée`);
    const [enriched] = await this.accueilClient.enrichWithIdentity([vpa]);
    return enriched;
  }

  async update(id: string, dto: UpdateVPADto): Promise<VPA> {
    const vpa = await this.repo.findOne({ where: { id } });
    if (!vpa) throw new NotFoundException(`VPA ${id} non trouvée`);
    return this.repo.save(Object.assign(vpa, dto));
  }

  async remove(id: string): Promise<{ message: string }> {
    const vpa = await this.repo.findOne({ where: { id } });
    if (!vpa) throw new NotFoundException(`VPA ${id} non trouvée`);
    await this.repo.delete(id);
    return { message: 'VPA supprimée' };
  }
}
