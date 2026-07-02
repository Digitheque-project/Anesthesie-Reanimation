import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CPA, DecisionCPA } from '../entities/cpa.entity';
import { PatientBloc, PatientStatut } from '../entities/patient-bloc.entity';
import { Premedicament } from '../entities/premedicament.entity';
import { AccueilClient } from '../external/accueil.client';
import { EndoscopieClient } from '../external/endoscopie.client';
import { DemandeCpaExterneService } from '../demande-cpa-externe/demande-cpa-externe.service';
import { CreateCPADto } from './dto/create-cpa.dto';
import { UpdateCPADto } from './dto/update-cpa.dto';

@Injectable()
export class CPAService {
  constructor(
    @InjectRepository(CPA) private cpaRepository: Repository<CPA>,
    @InjectRepository(PatientBloc) private patientBlocRepo: Repository<PatientBloc>,
    @InjectRepository(Premedicament) private premedRepository: Repository<Premedicament>,
    private accueilClient: AccueilClient,
    private endoscopieClient: EndoscopieClient,
    private demandeCpaExterneService: DemandeCpaExterneService,
  ) {}

  async create(dto: CreateCPADto): Promise<CPA> {
    const { premedicaments, ...cpaData } = dto as any;
    const cpa = this.cpaRepository.create(cpaData);
    const savedCPA = await this.cpaRepository.save(cpa);
    const saved = Array.isArray(savedCPA) ? savedCPA[0] : savedCPA;

    if (premedicaments?.length) {
      const premeds = premedicaments.map((p: any) => this.premedRepository.create({ ...p, cpa: saved }));
      await this.premedRepository.save(premeds);
    }

    if (dto.patientId) {
      await this.patientBlocRepo.update(dto.patientId, { statut: PatientStatut.CPA_REALISE });

      // Si une demande de CPA externe (ex: Endoscopie) est ouverte pour ce patient, la lier et notifier la source.
      const demande = await this.demandeCpaExterneService.trouverDemandeOuverte(dto.patientId);
      if (demande) {
        const apte = saved.decision === DecisionCPA.APTE;
        await this.demandeCpaExterneService.marquerCpaRealisee(demande, saved.id, apte);
        await this.endoscopieClient.notifyCpaResultat(demande, saved.decision, {
          dateCpa: saved.dateConsultation,
          observations: saved.notesIncidents,
        });
      }
    }

    return this.findOne(saved.id);
  }

  async findAll(page = 1, limite = 10) {
    const [data, total] = await this.cpaRepository.findAndCount({
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
