import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not } from 'typeorm';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { ActivitePerOp } from '../entities/activite-per-op.entity';
import { ScoreSCCRE } from '../entities/score-sccre.entity';
import { Medecin } from '../entities/medecin.entity';
import { CPA } from '../entities/cpa.entity';
import { NotificationCPA } from '../entities/notification-cpa.entity';
import { AccueilClient } from '../external/accueil.client';

@Injectable()
export class RapportsService {
  constructor(
    @InjectRepository(PatientBloc) private patientBlocRepo: Repository<PatientBloc>,
    @InjectRepository(ActivitePerOp) private activiteRepo: Repository<ActivitePerOp>,
    @InjectRepository(ScoreSCCRE) private scoreRepo: Repository<ScoreSCCRE>,
    @InjectRepository(Medecin) private medecinRepo: Repository<Medecin>,
    @InjectRepository(CPA) private cpaRepository: Repository<CPA>,
    @InjectRepository(NotificationCPA) private notifRepo: Repository<NotificationCPA>,
    private accueilClient: AccueilClient,
  ) {}

  async statistiquesGenerales(dateDebut?: string, dateFin?: string) {
    const whereAct = dateDebut && dateFin ? { dateOperation: Between(new Date(dateDebut), new Date(dateFin)) } : {};
    const actifs = { statut: Not('SORTI' as any) };

    const [
      totalPatients, totalPatientsActifs, totalOperations, totalUrgences, totalScores,
      patientsParStatut, urgencesParNiveau, totalMedecins,
    ] = await Promise.all([
      this.patientBlocRepo.count(),
      this.patientBlocRepo.count({ where: actifs }),
      this.activiteRepo.count({ where: whereAct }),
      this.patientBlocRepo.count({ where: { ...actifs, niveauUrgence: 'URGENT' as any } }),
      this.scoreRepo.count(),
      this.patientBlocRepo.createQueryBuilder('p').select('p.statut, COUNT(*) as count').groupBy('p.statut').getRawMany(),
      this.patientBlocRepo.createQueryBuilder('p').select('p.niveauUrgence, COUNT(*) as count').where('p.statut != :sorti', { sorti: 'SORTI' }).groupBy('p.niveauUrgence').getRawMany(),
      this.medecinRepo.count(),
    ]);

    return {
      totalPatients,
      totalPatientsActifs,
      totalOperations,
      totalUrgences,
      totalScores,
      totalMedecins,
      patientsParStatut,
      urgencesParNiveau,
    };
  }

  async activiteParChirurgien(dateDebut?: string, dateFin?: string) {
    const whereAct = dateDebut && dateFin ? { dateOperation: Between(new Date(dateDebut), new Date(dateFin)) } : {};
    return this.activiteRepo
      .createQueryBuilder('a')
      .leftJoin('a.chirurgien', 'm')
      .select('m.id', 'medecinId')
      .addSelect("CONCAT(m.prenom, ' ', m.nom)", 'nomComplet')
      .addSelect('COUNT(*)', 'nbOperations')
      .where(whereAct)
      .groupBy('m.id')
      .orderBy('nbOperations', 'DESC')
      .getRawMany();
  }

  async cpaEnAttente() {
    const data = await this.notifRepo.find({ where: { statut: 'EN_ATTENTE' as any }, relations: ['chirurgien'], order: { createdAt: 'ASC' } });
    return this.accueilClient.enrichWithIdentity(data);
  }

  async tauxOccupation(periode: string = 'mois') {
    // Simplifié : retourne les dates d'opération groupées
    return this.activiteRepo
      .createQueryBuilder('a')
      .select('DATE(a.dateOperation)', 'date')
      .addSelect('COUNT(*)', 'nbOperations')
      .groupBy('DATE(a.dateOperation)')
      .orderBy('date', 'ASC')
      .getRawMany();
  }

  async exportStatistiques(type: string, dateDebut?: string, dateFin?: string) {
    const stats = await this.statistiquesGenerales(dateDebut, dateFin);
    const activite = await this.activiteParChirurgien(dateDebut, dateFin);
    return {
      type,
      genereLe: new Date().toISOString(),
      statistiques: stats,
      activiteParChirurgien: activite,
    };
  }
}
