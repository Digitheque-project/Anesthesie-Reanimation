import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientBloc, NiveauUrgence, PatientStatut } from '../entities/patient-bloc.entity';
import { DemandeCpaExterne } from '../entities/demande-cpa-externe.entity';
import { AccueilClient } from '../external/accueil.client';
import { DossierPatientClient } from '../external/dossier-patient.client';

@Injectable()
export class PatientBlocService {
  constructor(
    @InjectRepository(PatientBloc)
    private patientRepo: Repository<PatientBloc>,
    @InjectRepository(DemandeCpaExterne)
    private demandeRepo: Repository<DemandeCpaExterne>,
    private accueilClient: AccueilClient,
    private dossierPatientClient: DossierPatientClient,
  ) {}

  async creerDepuisPrescription(demandeId: string): Promise<PatientBloc> {
    const demande = await this.demandeRepo.findOne({ where: { id: demandeId } });
    if (!demande) throw new Error('Demande non trouvée');

    const estUrgence = demande.urgence !== undefined && demande.urgence >= 3;
    const niveauUrgence = estUrgence ? NiveauUrgence.STAT : NiveauUrgence.NORMAL;
    // Un patient urgent n'a pas de "vérification à la veille" (chirurgie immédiate) : il passe
    // par la même consultation que la CPA, juste étiquetée VPA côté interface. Le statut initial
    // est donc toujours EN_ATTENTE_CPA, urgent ou non.

    const patient = new PatientBloc();
    patient.patientId = demande.patientId;
    patient.chuId = demande.chuId;
    patient.idDossier = `CHU-${Date.now()}`;
    patient.groupeSanguin = 'A+';
    patient.niveauUrgence = niveauUrgence;
    patient.statut = PatientStatut.EN_ATTENTE_CPA;
    patient.prescripteurId = demande.sourceServiceId;
    patient.serviceOrigine = demande.sourceServiceName || null;
    patient.serviceOrigineId = demande.sourceServiceId || null;

    const saved = await this.patientRepo.save(patient);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  estStat(patientId: string): boolean {
    return false;
  }

  async findAll(filters: { statut?: string; niveauUrgence?: string; recherche?: string; page?: number; limite?: number }) {
    const { statut, niveauUrgence, recherche, page = 1, limite = 10 } = filters;
    const qb = this.patientRepo.createQueryBuilder('p');

    if (statut) qb.andWhere('p.statut = :statut', { statut });
    if (niveauUrgence) qb.andWhere('p.niveauUrgence = :niveauUrgence', { niveauUrgence });
    if (recherche) qb.andWhere('p.idDossier ILIKE :recherche', { recherche: `%${recherche}%` });

    qb.orderBy('p.createdAt', 'DESC');
    qb.skip((page - 1) * limite).take(limite);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, pages: Math.ceil(total / limite) };
  }

  async findOne(patientId: string): Promise<PatientBloc | null> {
    const patient = await this.patientRepo.findOne({ where: { patientId } });
    if (!patient) return null;
    try {
      return await this.accueilClient.enrichWithIdentity(patient);
    } catch {
      return patient;
    }
  }

  // Contenu du dossier médical partagé (service externe Dossier Patient) pertinent pour le bloc :
  // antécédents actifs (allergies...), alertes médicales urgentes, dernier examen physique.
  // Tolérant aux pannes : une catégorie indisponible n'empêche pas les autres de s'afficher.
  async getDossierMedical(patientId: string, token: string) {
    const [antecedents, alertesUrgentes, dernierExamen] = await Promise.all([
      this.dossierPatientClient.getAntecedentsActifs(patientId, token),
      this.dossierPatientClient.getHistoriquesUrgents(patientId, token),
      this.dossierPatientClient.getDernierExamenPhysique(patientId, token),
    ]);
    return { antecedents, alertesUrgentes, dernierExamen };
  }

  async update(patientId: string, dto: any): Promise<PatientBloc> {
    const patient = await this.patientRepo.findOne({ where: { patientId } });
    if (!patient) throw new Error('Patient non trouvé');
    Object.assign(patient, dto);
    const saved = await this.patientRepo.save(patient);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async remove(patientId: string): Promise<{ message: string }> {
    await this.patientRepo.delete(patientId);
    return { message: 'Patient supprimé du bloc' };
  }

  async search(q?: string): Promise<any[]> {
    return [];
  }

  async getExternal(externalId: string): Promise<any> {
    return null;
  }

  async admitExisting(dto: any): Promise<PatientBloc> {
    const patient = this.patientRepo.create({
      ...dto,
      statut: PatientStatut.EN_ATTENTE_CPA,
      niveauUrgence: dto.niveauUrgence || NiveauUrgence.NORMAL,
    });
    const saved = await this.patientRepo.save(patient);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async registerAndAdmit(dto: any, createdBy: string): Promise<PatientBloc> {
    const patient = this.patientRepo.create({
      ...dto,
      statut: PatientStatut.EN_ATTENTE_CPA,
      niveauUrgence: dto.niveauUrgence || NiveauUrgence.NORMAL,
    });
    const saved = await this.patientRepo.save(patient);
    return Array.isArray(saved) ? saved[0] : saved;
  }
}
