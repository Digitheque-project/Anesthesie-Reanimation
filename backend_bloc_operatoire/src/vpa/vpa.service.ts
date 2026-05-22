import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VPA } from '../entities/vpa.entity';
import { Patient, PatientStatut } from '../entities/patient.entity';
import { CreateVPADto } from './dto/create-vpa.dto';
import { UpdateVPADto } from './dto/update-vpa.dto';

@Injectable()
export class VPAService {
  constructor(
    @InjectRepository(VPA) private repo: Repository<VPA>,
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
  ) {}

  async create(dto: CreateVPADto): Promise<VPA> {
    const saved = await this.repo.save(this.repo.create(dto as any));

    // Mettre à jour le statut du patient
    if (dto.patientId) {
      await this.patientRepo.update(dto.patientId, { statut: PatientStatut.VPA_REALISE });
    }

    return Array.isArray(saved) ? saved[0] : saved;
  }

  async findAll(page = 1, limite = 10) {
    const [data, total] = await this.repo.findAndCount({
      relations: ['patient', 'cpa', 'anesthesiste'],
      skip: (page - 1) * limite, take: limite, order: { createdAt: 'DESC' }
    });
    return { data, total, page, pages: Math.ceil(total / limite) };
  }

  async findOne(id: string): Promise<VPA> {
    const vpa = await this.repo.findOne({ where: { id }, relations: ['patient', 'cpa', 'anesthesiste'] });
    if (!vpa) throw new NotFoundException(`VPA ${id} non trouvée`);
    return vpa;
  }

  async update(id: string, dto: UpdateVPADto): Promise<VPA> {
    const vpa = await this.findOne(id);
    return this.repo.save(Object.assign(vpa, dto));
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.repo.delete(id);
    return { message: 'VPA supprimée' };
  }
}
