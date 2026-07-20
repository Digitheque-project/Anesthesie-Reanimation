import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, In } from 'typeorm';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { ActivitePerOp } from '../entities/activite-per-op.entity';
import { ScoreSCCRE } from '../entities/score-sccre.entity';
import { Medecin } from '../entities/medecin.entity';
import { CPA } from '../entities/cpa.entity';
import { NotificationCPA } from '../entities/notification-cpa.entity';
import { SortieReveil } from '../entities/sortie-reveil.entity';
import { ChecklistAvantOp } from '../entities/checklist-avant-op.entity';
import { ChecklistPendantOp } from '../entities/checklist-pendant-op.entity';
import { ChecklistApresOp } from '../entities/checklist-apres-op.entity';
import { MomentOperatoire } from '../entities/moment-operatoire.entity';
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
    @InjectRepository(SortieReveil) private sortieRepo: Repository<SortieReveil>,
    @InjectRepository(ChecklistAvantOp) private checklistAvantRepo: Repository<ChecklistAvantOp>,
    @InjectRepository(ChecklistPendantOp) private checklistPendantRepo: Repository<ChecklistPendantOp>,
    @InjectRepository(ChecklistApresOp) private checklistApresRepo: Repository<ChecklistApresOp>,
    @InjectRepository(MomentOperatoire) private momentRepo: Repository<MomentOperatoire>,
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
      .andWhere('a.chirurgienId IS NOT NULL')
      .groupBy('m.id')
      .orderBy('nbOperations', 'DESC')
      .getRawMany();
  }

  // Activité par anesthésiste : combine les CPA réalisées, les scores de réveil évalués et les
  // opérations suivies — les trois actes cliniques distincts que l'anesthésiste réalise le long
  // du parcours patient (miroir de la gestion des rôles CPA/pendant l'opération/salle de réveil).
  async activiteParAnesthesiste(dateDebut?: string, dateFin?: string) {
    const periodeCPA = dateDebut && dateFin ? { dateConsultation: Between(new Date(dateDebut), new Date(dateFin)) } : {};
    const periodeAct = dateDebut && dateFin ? { dateOperation: Between(new Date(dateDebut), new Date(dateFin)) } : {};

    const [cpaParAnesthesiste, operationsParAnesthesiste, scoresParAnesthesiste] = await Promise.all([
      this.cpaRepository.createQueryBuilder('c')
        .leftJoin('c.anesthesiste', 'm')
        .select('m.id', 'medecinId').addSelect("CONCAT(m.prenom, ' ', m.nom)", 'nomComplet').addSelect('COUNT(*)', 'nb')
        .where(periodeCPA).groupBy('m.id').getRawMany(),
      this.activiteRepo.createQueryBuilder('a')
        .leftJoin('a.anesthesiste', 'm')
        .select('m.id', 'medecinId').addSelect("CONCAT(m.prenom, ' ', m.nom)", 'nomComplet').addSelect('COUNT(*)', 'nb')
        .where(periodeAct).andWhere('a.anesthesisteId IS NOT NULL').groupBy('m.id').getRawMany(),
      this.scoreRepo.createQueryBuilder('s')
        .leftJoin('s.anesthesiste', 'm')
        .select('m.id', 'medecinId').addSelect("CONCAT(m.prenom, ' ', m.nom)", 'nomComplet').addSelect('COUNT(*)', 'nb')
        .groupBy('m.id').getRawMany(),
    ]);

    const parId = new Map<string, { medecinId: string; nomComplet: string; nbCPA: number; nbOperations: number; nbScoresSCCRE: number }>();
    const assurer = (id: string, nom: string) => {
      if (!parId.has(id)) parId.set(id, { medecinId: id, nomComplet: nom, nbCPA: 0, nbOperations: 0, nbScoresSCCRE: 0 });
      return parId.get(id)!;
    };
    cpaParAnesthesiste.forEach((r: any) => { if (r.medecinId) assurer(r.medecinId, r.nomComplet).nbCPA = Number(r.nb); });
    operationsParAnesthesiste.forEach((r: any) => { if (r.medecinId) assurer(r.medecinId, r.nomComplet).nbOperations = Number(r.nb); });
    scoresParAnesthesiste.forEach((r: any) => { if (r.medecinId) assurer(r.medecinId, r.nomComplet).nbScoresSCCRE = Number(r.nb); });

    return Array.from(parId.values()).sort((a, b) => (b.nbCPA + b.nbOperations + b.nbScoresSCCRE) - (a.nbCPA + a.nbOperations + a.nbScoresSCCRE));
  }

  async decisionsCPA(dateDebut?: string, dateFin?: string) {
    const periode = dateDebut && dateFin ? { dateConsultation: Between(new Date(dateDebut), new Date(dateFin)) } : {};
    return this.cpaRepository.createQueryBuilder('c').select('c.decision', 'decision').addSelect('COUNT(*)', 'count').where(periode).groupBy('c.decision').getRawMany();
  }

  async typesChirurgie() {
    return this.patientBlocRepo.createQueryBuilder('p')
      .select('COALESCE(p.typeChirurgie, \'Non spécifié\')', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('p.typeChirurgie')
      .orderBy('count', 'DESC')
      .getRawMany();
  }

  async tachesAccomplies(dateDebut?: string, dateFin?: string) {
    const periode = dateDebut && dateFin ? { dateCreation: Between(new Date(dateDebut), new Date(dateFin)) } : {};
    const [signIn, timeOut, signOut, moments] = await Promise.all([
      this.checklistAvantRepo.count({ where: periode }),
      this.checklistPendantRepo.count({ where: periode }),
      this.checklistApresRepo.count({ where: periode }),
      this.momentRepo.count({ where: { annule: false } }),
    ]);
    return { checklistsAvantOp: signIn, checklistsPendantOp: timeOut, checklistsApresOp: signOut, momentsOperatoires: moments };
  }

  async cpaEnAttente() {
    const data = await this.notifRepo.find({ where: { statut: 'EN_ATTENTE' as any }, relations: ['chirurgien'], order: { createdAt: 'ASC' } });
    return this.accueilClient.enrichWithIdentity(data);
  }

  async tauxOccupation(dateDebut?: string, dateFin?: string) {
    const qb = this.activiteRepo.createQueryBuilder('a')
      .select('DATE(a.dateOperation)', 'date')
      .addSelect('COUNT(*)', 'nbOperations')
      .groupBy('DATE(a.dateOperation)')
      .orderBy('date', 'ASC');
    if (dateDebut && dateFin) qb.where('a.dateOperation BETWEEN :debut AND :fin', { debut: dateDebut, fin: dateFin });
    return qb.getRawMany();
  }

  // Liste détaillée des opérations (identité patient enrichie), pour le tableau "détail" du
  // rapport et ses exports — bornée pour rester exploitable à l'écran.
  async operationsDetail(dateDebut?: string, dateFin?: string, limite = 300) {
    const whereAct = dateDebut && dateFin ? { dateOperation: Between(new Date(dateDebut), new Date(dateFin)) } : {};
    const activites = await this.activiteRepo.find({
      where: whereAct,
      relations: ['chirurgien', 'anesthesiste'],
      order: { dateOperation: 'DESC' },
      take: limite,
    });
    const patientIds = Array.from(new Set(activites.map(a => a.patientId)));
    const patients = patientIds.length ? await this.patientBlocRepo.findBy({ patientId: In(patientIds) }) : [];
    // Identité (nom/prénom) enrichie depuis Accueil — jamais l'ID affiché à la place côté front.
    let patientsEnrichis: any[] = patients;
    try {
      patientsEnrichis = await this.accueilClient.enrichWithIdentity(patients);
    } catch {
      // dégradé vers les données non enrichies
    }
    const patientMap = new Map(patientsEnrichis.map((p) => [p.patientId, p]));

    return activites.map(a => {
      const patient = patientMap.get(a.patientId);
      return {
        patientNom: patient?.nom ? `${patient.nom}${patient.prenom ? ' ' + patient.prenom : ''}` : 'Patient inconnu',
        libelle: patient?.libelle || '—',
        typeChirurgie: patient?.typeChirurgie || '—',
        niveauUrgence: patient?.niveauUrgence || '—',
        statut: patient?.statut || '—',
        dateOperation: a.dateOperation,
        chirurgien: a.chirurgien ? `${a.chirurgien.prenom} ${a.chirurgien.nom}` : '—',
        anesthesiste: a.anesthesiste ? `${a.anesthesiste.prenom} ${a.anesthesiste.nom}` : '—',
      };
    });
  }

  // Point d'entrée unique du dashboard Rapport : agrège tout ce qui précède en un seul appel,
  // filtré sur la même période, pour éviter les incohérences entre widgets et limiter le nombre
  // de requêtes réseau du frontend.
  async tableauDeBord(dateDebut?: string, dateFin?: string) {
    const [
      statistiques, activiteParChirurgien, activiteParAnesthesiste, decisionsCPA,
      typesChirurgie, tachesAccomplies, evolutionQuotidienne, operationsDetail, sortiesReveil,
    ] = await Promise.all([
      this.statistiquesGenerales(dateDebut, dateFin),
      this.activiteParChirurgien(dateDebut, dateFin),
      this.activiteParAnesthesiste(dateDebut, dateFin),
      this.decisionsCPA(dateDebut, dateFin),
      this.typesChirurgie(),
      this.tachesAccomplies(dateDebut, dateFin),
      this.tauxOccupation(dateDebut, dateFin),
      this.operationsDetail(dateDebut, dateFin),
      this.sortieRepo.count(),
    ]);

    return {
      periode: { dateDebut: dateDebut || null, dateFin: dateFin || null },
      genereLe: new Date().toISOString(),
      statistiques: { ...statistiques, totalSortiesReveil: sortiesReveil },
      activiteParChirurgien,
      activiteParAnesthesiste,
      decisionsCPA,
      typesChirurgie,
      tachesAccomplies,
      evolutionQuotidienne,
      operationsDetail,
    };
  }

  async exportStatistiques(type: string, dateDebut?: string, dateFin?: string) {
    return this.tableauDeBord(dateDebut, dateFin);
  }
}
