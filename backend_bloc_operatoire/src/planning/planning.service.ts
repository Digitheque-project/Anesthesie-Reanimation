import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreneauBloc, StatutCreneau, TypeRDV } from '../entities/creneau-bloc.entity';
import { PatientBloc, PatientStatut } from '../entities/patient-bloc.entity';
import { AccueilClient } from '../external/accueil.client';

@Injectable()
export class PlanningService {
  constructor(
    @InjectRepository(CreneauBloc) private creneauRepo: Repository<CreneauBloc>,
    @InjectRepository(PatientBloc) private patientBlocRepo: Repository<PatientBloc>,
    private accueilClient: AccueilClient,
  ) {}

  async getPlanningJour(jour: string, type?: TypeRDV) {
    const qb = this.creneauRepo.createQueryBuilder('c')
      .leftJoinAndSelect('c.chirurgien', 'm')
      .where('c.date = :date', { date: jour })
      .orderBy('c.heureDebut', 'ASC');
    if (type) qb.andWhere('c.type = :type', { type });
    const data = await qb.getMany();
    return this.accueilClient.enrichWithIdentity(data);
  }

  async getPlanningSemaine(debut: string, fin: string, type?: TypeRDV) {
    const qb = this.creneauRepo.createQueryBuilder('c')
      .leftJoinAndSelect('c.chirurgien', 'm')
      .where('c.date >= :debut', { debut })
      .andWhere('c.date <= :fin', { fin })
      .orderBy('c.date', 'ASC').addOrderBy('c.heureDebut', 'ASC');
    if (type) qb.andWhere('c.type = :type', { type });
    const data = await qb.getMany();
    return this.accueilClient.enrichWithIdentity(data);
  }

  async reserverCreneau(dto: any) {
    const creneau = this.creneauRepo.create({ ...dto, type: dto.type || TypeRDV.CPA });
    return this.creneauRepo.save(creneau);
  }

  async annulerCreneau(id: string) {
    const creneau = await this.creneauRepo.findOne({ where: { id } });
    if (!creneau) throw new NotFoundException('Créneau non trouvé');
    creneau.statut = StatutCreneau.ANNULE;
    return this.creneauRepo.save(creneau);
  }

  async getUrgencesEnAttente() {
    const data = await this.creneauRepo.find({ where: { estUrgence: true }, relations: ['chirurgien'] });
    return this.accueilClient.enrichWithIdentity(data);
  }

  // Transférer CPA vers VPA
  async transfererCpaVersVpa(dto: { patientId: string; chirurgienId: string; dateVPA: string; heureDebut: string; salle: string }) {
    const patient = await this.patientBlocRepo.findOne({ where: { patientId: dto.patientId } });
    if (!patient) throw new NotFoundException('Patient non trouvé');

    patient.statut = PatientStatut.EN_ATTENTE_VPA;
    await this.patientBlocRepo.save(patient);

    const creneau = this.creneauRepo.create({
      patientId: dto.patientId,
      chirurgienId: dto.chirurgienId,
      date: dto.dateVPA,
      heureDebut: dto.heureDebut,
      heureFin: dto.heureDebut,
      salle: dto.salle,
      type: TypeRDV.VPA,
    });
    return this.creneauRepo.save(creneau);
  }

  // Transférer VPA vers Patient du jour
  async transfererVpaVersPatientJour(dto: { patientId: string; chirurgienId: string; date: string; heureDebut: string; salle: string }) {
    const patient = await this.patientBlocRepo.findOne({ where: { patientId: dto.patientId } });
    if (!patient) throw new NotFoundException('Patient non trouvé');

    patient.statut = PatientStatut.PRET_POUR_BLOC;
    await this.patientBlocRepo.save(patient);

    const creneau = this.creneauRepo.create({
      patientId: dto.patientId,
      chirurgienId: dto.chirurgienId,
      date: dto.date,
      heureDebut: dto.heureDebut,
      heureFin: dto.heureDebut,
      salle: dto.salle,
      type: TypeRDV.VPA,
      statut: StatutCreneau.TERMINE,
    });
    return this.creneauRepo.save(creneau);
  }
}
