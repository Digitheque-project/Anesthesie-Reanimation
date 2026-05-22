import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    const patient = this.patientRepository.create(createPatientDto);
    return this.patientRepository.save(patient);
  }

  async findAll(filters?: {
    statut?: string;
    niveauUrgence?: string;
    recherche?: string;
    page?: number;
    limite?: number;
  }): Promise<{ data: Patient[]; total: number; page: number; pages: number }> {
    const { statut, niveauUrgence, recherche, page = 1, limite = 10 } = filters || {};
    const skip = (page - 1) * limite;

    let where: FindOptionsWhere<Patient>[] | FindOptionsWhere<Patient> = {};

    if (statut) {
      where = { ...where, statut: statut as any };
    }
    if (niveauUrgence) {
      where = { ...where, niveauUrgence: niveauUrgence as any };
    }
    if (recherche) {
      where = [
        { ...where, nom: Like(`%${recherche}%`) },
        { ...where, prenom: Like(`%${recherche}%`) },
        { ...where, idDossier: Like(`%${recherche}%`) },
      ];
    }

    const [data, total] = await this.patientRepository.findAndCount({
      where,
      skip,
      take: limite,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, pages: Math.ceil(total / limite) };
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientRepository.findOne({ where: { id } });
    if (!patient) {
      throw new NotFoundException(`Patient avec l'ID ${id} non trouvé`);
    }
    return patient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient> {
    const patient = await this.findOne(id);
    Object.assign(patient, updatePatientDto);
    return this.patientRepository.save(patient);
  }

  async remove(id: string): Promise<{ message: string }> {
    const patient = await this.findOne(id);
    await this.patientRepository.remove(patient);
    return { message: 'Patient supprimé avec succès' };
  }
}
