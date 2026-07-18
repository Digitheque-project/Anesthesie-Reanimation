import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { CPA } from '../entities/cpa.entity';
import { VerificationVeille } from '../entities/verification-veille.entity';
import { BonCommandeAnesthesie } from '../entities/bon-commande-anesthesie.entity';
import { ActivitePerOp } from '../entities/activite-per-op.entity';
import { ProtocoleOperatoire } from '../entities/protocole-operatoire.entity';
import { ScoreSCCRE } from '../entities/score-sccre.entity';
import { SortieReveil } from '../entities/sortie-reveil.entity';
import { ChecklistAvantOp } from '../entities/checklist-avant-op.entity';
import { ChecklistPendantOp } from '../entities/checklist-pendant-op.entity';
import { ChecklistApresOp } from '../entities/checklist-apres-op.entity';
import { NotificationCPA } from '../entities/notification-cpa.entity';
import { DemandeCpaExterne } from '../entities/demande-cpa-externe.entity';
import { MomentOperatoire } from '../entities/moment-operatoire.entity';
import { AccueilClient } from '../external/accueil.client';

@Injectable()
export class ArchivesService {
  constructor(
    @InjectRepository(PatientBloc) private patientBlocRepo: Repository<PatientBloc>,
    @InjectRepository(CPA) private cpaRepository: Repository<CPA>,
    @InjectRepository(VerificationVeille) private verificationVeilleRepository: Repository<VerificationVeille>,
    @InjectRepository(BonCommandeAnesthesie) private bonRepo: Repository<BonCommandeAnesthesie>,
    @InjectRepository(ActivitePerOp) private activiteRepo: Repository<ActivitePerOp>,
    @InjectRepository(ProtocoleOperatoire) private protocoleRepo: Repository<ProtocoleOperatoire>,
    @InjectRepository(ScoreSCCRE) private scoreRepo: Repository<ScoreSCCRE>,
    @InjectRepository(SortieReveil) private sortieRepo: Repository<SortieReveil>,
    @InjectRepository(ChecklistAvantOp) private checklistAvantRepo: Repository<ChecklistAvantOp>,
    @InjectRepository(ChecklistPendantOp) private checklistPendantRepo: Repository<ChecklistPendantOp>,
    @InjectRepository(ChecklistApresOp) private checklistApresRepo: Repository<ChecklistApresOp>,
    @InjectRepository(NotificationCPA) private notificationRepo: Repository<NotificationCPA>,
    @InjectRepository(DemandeCpaExterne) private demandeExterneRepo: Repository<DemandeCpaExterne>,
    @InjectRepository(MomentOperatoire) private momentRepo: Repository<MomentOperatoire>,
    private accueilClient: AccueilClient,
  ) {}

  private async getPatientEnrichi(patientId: string) {
    const suivi = await this.patientBlocRepo.findOne({ where: { patientId } });
    if (!suivi) throw new NotFoundException('Patient non trouvé');
    const identite = await this.accueilClient.getPatient(patientId);
    return { ...suivi, ...identite, patientId };
  }

  async getDossierComplet(patientId: string): Promise<any> {
    const patient = await this.getPatientEnrichi(patientId);

    const [
      notifications, demandesExternes, cpa, verificationVeille, bons,
      checklistsAvant, checklistsPendant, checklistsApres,
      moments, activites, protocoles, scores, sorties,
    ] = await Promise.all([
      this.notificationRepo.find({ where: { patientId }, relations: ['chirurgien'], order: { createdAt: 'ASC' } }),
      this.demandeExterneRepo.find({ where: { patientId }, order: { createdAt: 'ASC' } }),
      this.cpaRepository.find({ where: { patientId }, relations: ['premedicaments', 'anesthesiste'] }),
      this.verificationVeilleRepository.find({ where: { patientId }, relations: ['anesthesiste'] }),
      this.bonRepo.find({ where: { patientId }, relations: ['items', 'chirurgien', 'anesthesiste'] }),
      this.checklistAvantRepo.find({ where: { patientId } }),
      this.checklistPendantRepo.find({ where: { patientId } }),
      this.checklistApresRepo.find({ where: { patientId } }),
      this.momentRepo.find({ where: { patientId }, order: { horodatage: 'ASC' } }),
      this.activiteRepo.find({ where: { patientId }, relations: ['constantes', 'chirurgien', 'anesthesiste'] }),
      this.protocoleRepo.find({ where: { patientId }, relations: ['drainages', 'chirurgien', 'anesthesiste', 'infirmiere', 'aideOperatoire'] }),
      this.scoreRepo.find({ where: { patientId }, relations: ['anesthesiste'] }),
      this.sortieRepo.find({ where: { patientId }, relations: ['scoreSCCRE', 'medecin'] }),
    ]);

    return {
      patient,
      // Étape 1 : prescription reçue — interne (fil de prescription du service) et/ou externe
      // (demande d'un autre service, ex. Endoscopie).
      notifications,
      demandesCpaExternes: demandesExternes,
      cpa: cpa[0] || null,
      verificationVeille: verificationVeille[0] || null,
      bonsCommande: bons,
      checklistsAvantOp: checklistsAvant,
      checklistsPendantOp: checklistsPendant,
      checklistsApresOp: checklistsApres,
      // Chronologie horodatée des moments de l'opération (incision, fermeture...).
      momentsOperatoires: moments,
      activitesPerOp: activites,
      protocolesOperatoires: protocoles,
      scoresSCCRE: scores,
      sortiesReveil: sorties,
      dateArchivage: new Date().toISOString(),
    };
  }

  async getResumePatient(patientId: string): Promise<any> {
    const patient = await this.getPatientEnrichi(patientId);
    const nbInterventions = await this.activiteRepo.count({ where: { patientId } });
    const dernierScore = await this.scoreRepo.findOne({ where: { patientId }, order: { createdAt: 'DESC' } });
    return { patient, nombreInterventions: nbInterventions, dernierScoreSCCRE: dernierScore?.scoreTotal || null, statutActuel: patient.statut };
  }
}
