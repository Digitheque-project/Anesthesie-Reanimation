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
  ) {}

  async create(dto: CreateCPADto): Promise<CPA> {
    if (dto.decision === DecisionCPA.INAPTE && (!dto.motifRefus || dto.motifRefus.trim() === '')) {
      throw new BadRequestException('Le motif du refus est obligatoire lorsque la décision est INAPTE.');
    }

    const { premedicaments, ...cpaData } = dto as any;
    const cpa = this.cpaRepository.create(cpaData);
    const savedCPA = await this.cpaRepository.save(cpa);
    const saved = Array.isArray(savedCPA) ? savedCPA[0] : savedCPA;

    if (premedicaments?.length) {
      const premeds = premedicaments.map((p: any) => this.premedRepository.create({ ...p, cpa: saved }));
      await this.premedRepository.save(premeds);
    }

    if (dto.patientId) {
      const nouveauStatut = dto.decision === DecisionCPA.INAPTE
        ? PatientStatut.CPA_INAPTE
        : PatientStatut.CPA_REALISE;

      await this.patientBlocRepo.update(dto.patientId, { statut: nouveauStatut });

      const demande = await this.demandeCpaExterneService.trouverDemandeOuverte(dto.patientId);
      if (demande) {
        const apte = saved.decision === DecisionCPA.APTE;
        await this.demandeCpaExterneService.marquerCpaRealisee(demande, saved.id, apte);
        try {
          await this.endoscopieClient.notifyCpaResultat(demande, saved.decision, {
            dateCpa: saved.dateConsultation,
            observations: saved.notesIncidents,
          });
        } catch (err) {
          this.logger.error(`Erreur notification Endoscopie: ${(err as Error).message}`);
        }
      }

      try {
        const patient = await this.patientBlocRepo.findOne({ where: { patientId: dto.patientId } });
        if (patient?.serviceOrigineId && patient?.serviceOrigine) {
          await this.notificationOutgoing.notifyOriginService({
            patientId: dto.patientId,
            type: dto.decision === DecisionCPA.INAPTE ? 'CPA_INAPTE' : 'CPA_APTE',
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
