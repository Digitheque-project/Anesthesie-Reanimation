import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CPA } from '../entities/cpa.entity';
import { Patient, PatientStatut } from '../entities/patient.entity';
import { Premedicament } from '../entities/premedicament.entity';
import { CreateCPADto } from './dto/create-cpa.dto';
import { UpdateCPADto } from './dto/update-cpa.dto';

@Injectable()
export class CPAService {
  constructor(
    @InjectRepository(CPA) private cpaRepository: Repository<CPA>,
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    @InjectRepository(Premedicament) private premedRepository: Repository<Premedicament>,
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
      await this.patientRepo.update(dto.patientId, { statut: PatientStatut.CPA_REALISE });
    }

    return this.findOne(saved.id);
  }

  async findAll(page = 1, limite = 10) {
    const [data, total] = await this.cpaRepository.findAndCount({
      relations: ['patient', 'anesthesiste', 'premedicaments'],
      skip: (page - 1) * limite, take: limite, order: { createdAt: 'DESC' }
    });
    return { data, total, page, pages: Math.ceil(total / limite) };
  }

  async findOne(id: string): Promise<CPA> {
    const cpa = await this.cpaRepository.findOne({ where: { id }, relations: ['patient', 'anesthesiste', 'premedicaments'] });
    if (!cpa) throw new NotFoundException(`CPA ${id} non trouvée`);
    return cpa;
  }

  async update(id: string, dto: UpdateCPADto): Promise<CPA> {
    const cpa = await this.findOne(id);
    Object.assign(cpa, dto);
    return this.cpaRepository.save(cpa);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.cpaRepository.delete(id);
    return { message: 'CPA supprimée' };
  }
}
