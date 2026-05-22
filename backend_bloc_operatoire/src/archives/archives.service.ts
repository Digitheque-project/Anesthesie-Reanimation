import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { CPA } from '../entities/cpa.entity';
import { VPA } from '../entities/vpa.entity';
import { BonCommandeAnesthesie } from '../entities/bon-commande-anesthesie.entity';
import { ActivitePerOp } from '../entities/activite-per-op.entity';
import { ProtocoleOperatoire } from '../entities/protocole-operatoire.entity';
import { ScoreSCCRE } from '../entities/score-sccre.entity';
import { SortieReveil } from '../entities/sortie-reveil.entity';
import { ChecklistAvantOp } from '../entities/checklist-avant-op.entity';
import { ChecklistPendantOp } from '../entities/checklist-pendant-op.entity';
import { ChecklistApresOp } from '../entities/checklist-apres-op.entity';

@Injectable()
export class ArchivesService {
  constructor(
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    @InjectRepository(CPA) private cpaRepository: Repository<CPA>,
    @InjectRepository(VPA) private vpaRepository: Repository<VPA>,
    @InjectRepository(BonCommandeAnesthesie) private bonRepo: Repository<BonCommandeAnesthesie>,
    @InjectRepository(ActivitePerOp) private activiteRepo: Repository<ActivitePerOp>,
    @InjectRepository(ProtocoleOperatoire) private protocoleRepo: Repository<ProtocoleOperatoire>,
    @InjectRepository(ScoreSCCRE) private scoreRepo: Repository<ScoreSCCRE>,
    @InjectRepository(SortieReveil) private sortieRepo: Repository<SortieReveil>,
    @InjectRepository(ChecklistAvantOp) private checklistAvantRepo: Repository<ChecklistAvantOp>,
    @InjectRepository(ChecklistPendantOp) private checklistPendantRepo: Repository<ChecklistPendantOp>,
    @InjectRepository(ChecklistApresOp) private checklistApresRepo: Repository<ChecklistApresOp>,
  ) {}

  async getDossierComplet(patientId: string): Promise<any> {
    const patient = await this.patientRepo.findOne({ where: { id: patientId } });
    if (!patient) throw new NotFoundException('Patient non trouvé');

    const [cpa, vpa, bons, checklistsAvant, checklistsPendant, checklistsApres, activites, protocoles, scores, sorties] = await Promise.all([
      this.cpaRepository.find({ where: { patientId }, relations: ['premedicaments', 'anesthesiste'] }),
      this.vpaRepository.find({ where: { patientId }, relations: ['anesthesiste'] }),
      this.bonRepo.find({ where: { patientId }, relations: ['items', 'chirurgien', 'anesthesiste'] }),
      this.checklistAvantRepo.find({ where: { patientId } }),
      this.checklistPendantRepo.find({ where: { patientId } }),
      this.checklistApresRepo.find({ where: { patientId } }),
      this.activiteRepo.find({ where: { patientId }, relations: ['constantes', 'chirurgien', 'anesthesiste'] }),
      this.protocoleRepo.find({ where: { patientId }, relations: ['drainages', 'chirurgien', 'anesthesiste', 'infirmiere', 'aideOperatoire'] }),
      this.scoreRepo.find({ where: { patientId }, relations: ['anesthesiste'] }),
      this.sortieRepo.find({ where: { patientId }, relations: ['scoreSCCRE', 'medecin'] }),
    ]);

    return {
      patient,
      cpa: cpa[0] || null,
      vpa: vpa[0] || null,
      bonsCommande: bons,
      checklistsAvantOp: checklistsAvant,
      checklistsPendantOp: checklistsPendant,
      checklistsApresOp: checklistsApres,
      activitesPerOp: activites,
      protocolesOperatoires: protocoles,
      scoresSCCRE: scores,
      sortiesReveil: sorties,
      dateArchivage: new Date().toISOString(),
    };
  }

  async getResumePatient(patientId: string): Promise<any> {
    const patient = await this.patientRepo.findOne({ where: { id: patientId } });
    if (!patient) throw new NotFoundException('Patient non trouvé');
    const nbInterventions = await this.activiteRepo.count({ where: { patientId } });
    const dernierScore = await this.scoreRepo.findOne({ where: { patientId }, order: { createdAt: 'DESC' } });
    return { patient, nombreInterventions: nbInterventions, dernierScoreSCCRE: dernierScore?.scoreTotal || null, statutActuel: patient.statut };
  }
}
