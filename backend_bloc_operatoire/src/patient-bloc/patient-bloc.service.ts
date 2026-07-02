import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Like, Repository } from 'typeorm';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { AccueilClient } from '../external/accueil.client';
import { AdmitExistingPatientDto } from './dto/admit-existing-patient.dto';
import { RegisterAndAdmitPatientDto } from './dto/register-and-admit-patient.dto';
import { UpdatePatientBlocDto } from './dto/update-patient-bloc.dto';

@Injectable()
export class PatientBlocService {
  constructor(
    @InjectRepository(PatientBloc) private patientBlocRepo: Repository<PatientBloc>,
    private accueilClient: AccueilClient,
    private config: ConfigService,
  ) {}

  async search(q?: string) {
    return this.accueilClient.searchPatients(q ?? '');
  }

  async getExternal(externalId: string) {
    const patient = await this.accueilClient.getPatient(externalId);
    if (!patient) throw new NotFoundException(`Patient ${externalId} introuvable dans le service Accueil`);
    return patient;
  }

  async admitExisting(dto: AdmitExistingPatientDto): Promise<PatientBloc> {
    const external = await this.accueilClient.getPatient(dto.patientId);
    if (!external) throw new NotFoundException(`Patient ${dto.patientId} introuvable dans le service Accueil`);

    const existing = await this.patientBlocRepo.findOne({ where: { patientId: dto.patientId } });
    if (existing) throw new ConflictException(`Le patient ${dto.patientId} est déjà admis au bloc`);

    const { patientId, ...operationalFields } = dto;
    const record = this.patientBlocRepo.create({
      ...operationalFields,
      patientId,
      chuId: this.config.get<string>('externalServices.chuId'),
    });
    return this.patientBlocRepo.save(record);
  }

  async registerAndAdmit(dto: RegisterAndAdmitPatientDto, createdBy: string): Promise<PatientBloc> {
    const external = await this.accueilClient.registerPatient(dto.identite, createdBy);
    const { identite, ...operationalFields } = dto;
    const record = this.patientBlocRepo.create({
      ...operationalFields,
      patientId: external.id,
      chuId: this.config.get<string>('externalServices.chuId'),
    });
    return this.patientBlocRepo.save(record);
  }

  async findAll(filters?: {
    statut?: string;
    niveauUrgence?: string;
    recherche?: string;
    page?: number;
    limite?: number;
  }) {
    const { statut, niveauUrgence, recherche, page = 1, limite = 10 } = filters || {};
    const skip = (page - 1) * limite;

    let where: any = {};
    if (statut) where.statut = statut;
    if (niveauUrgence) where.niveauUrgence = niveauUrgence;
    if (recherche) where.idDossier = Like(`%${recherche}%`);

    const [data, total] = await this.patientBlocRepo.findAndCount({
      where,
      skip,
      take: limite,
      order: { createdAt: 'DESC' },
    });

    const enriched = await this.accueilClient.enrichWithIdentity(data);
    return { data: enriched, total, page, pages: Math.ceil(total / limite) };
  }

  async findOne(patientId: string) {
    const record = await this.patientBlocRepo.findOne({ where: { patientId } });
    if (!record) throw new NotFoundException(`Fiche de suivi bloc introuvable pour le patient ${patientId}`);
    const [enriched] = await this.accueilClient.enrichWithIdentity([record]);
    return enriched;
  }

  async update(patientId: string, dto: UpdatePatientBlocDto): Promise<PatientBloc> {
    const record = await this.patientBlocRepo.findOne({ where: { patientId } });
    if (!record) throw new NotFoundException(`Fiche de suivi bloc introuvable pour le patient ${patientId}`);
    Object.assign(record, dto);
    return this.patientBlocRepo.save(record);
  }

  async remove(patientId: string): Promise<{ message: string }> {
    const record = await this.patientBlocRepo.findOne({ where: { patientId } });
    if (!record) throw new NotFoundException(`Fiche de suivi bloc introuvable pour le patient ${patientId}`);
    await this.patientBlocRepo.remove(record);
    return { message: 'Fiche de suivi supprimée avec succès' };
  }
}
