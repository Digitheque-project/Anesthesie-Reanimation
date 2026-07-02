import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository, In } from 'typeorm';
import { DemandeCpaExterne, StatutDemandeCpaExterne } from '../entities/demande-cpa-externe.entity';
import { ReceiveDemandeCpaDto } from './dto/receive-demande-cpa.dto';
import { UpdateDemandeCpaDto } from './dto/update-demande-cpa.dto';

@Injectable()
export class DemandeCpaExterneService {
  private readonly logger = new Logger(DemandeCpaExterneService.name);

  constructor(
    @InjectRepository(DemandeCpaExterne) private repo: Repository<DemandeCpaExterne>,
    private config: ConfigService,
  ) {}

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
    return saved;
  }

  async findAll(statut?: StatutDemandeCpaExterne) {
    return this.repo.find({ where: statut ? { statut } : {}, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<DemandeCpaExterne> {
    const demande = await this.repo.findOne({ where: { id } });
    if (!demande) throw new NotFoundException(`Demande de CPA externe ${id} non trouvée`);
    return demande;
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
}
