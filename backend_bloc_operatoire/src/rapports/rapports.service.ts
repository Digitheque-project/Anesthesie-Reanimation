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
import { ProtocoleOperatoire } from '../entities/protocole-operatoire.entity';
import { AccueilClient } from '../external/accueil.client';
import { MedecinIdentiteService } from '../medecin/medecin-identite.service';

@Injectable()
export class RapportsService {
  constructor(
    @InjectRepository(PatientBloc)
    private patientBlocRepo: Repository<PatientBloc>,
    @InjectRepository(ActivitePerOp)
    private activiteRepo: Repository<ActivitePerOp>,
    @InjectRepository(ScoreSCCRE) private scoreRepo: Repository<ScoreSCCRE>,
    @InjectRepository(Medecin) private medecinRepo: Repository<Medecin>,
    @InjectRepository(CPA) private cpaRepository: Repository<CPA>,
    @InjectRepository(NotificationCPA)
    private notifRepo: Repository<NotificationCPA>,
    @InjectRepository(SortieReveil)
    private sortieRepo: Repository<SortieReveil>,
    @InjectRepository(ChecklistAvantOp)
    private checklistAvantRepo: Repository<ChecklistAvantOp>,
    @InjectRepository(ChecklistPendantOp)
    private checklistPendantRepo: Repository<ChecklistPendantOp>,
    @InjectRepository(ChecklistApresOp)
    private checklistApresRepo: Repository<ChecklistApresOp>,
    @InjectRepository(MomentOperatoire)
    private momentRepo: Repository<MomentOperatoire>,
    @InjectRepository(ProtocoleOperatoire)
    private protocoleRepo: Repository<ProtocoleOperatoire>,
    private accueilClient: AccueilClient,
    private medecinIdentiteService: MedecinIdentiteService,
  ) {}

  async statistiquesGenerales(dateDebut?: string, dateFin?: string) {
    const whereAct =
      dateDebut && dateFin
        ? { dateOperation: Between(new Date(dateDebut), new Date(dateFin)) }
        : {};
    const actifs = { statut: Not('SORTI' as any) };

    const [
      totalPatients,
      totalPatientsActifs,
      totalOperations,
      totalUrgences,
      totalScores,
      patientsParStatut,
      urgencesParNiveau,
      totalMedecins,
    ] = await Promise.all([
      this.patientBlocRepo.count(),
      this.patientBlocRepo.count({ where: actifs }),
      this.activiteRepo.count({ where: whereAct }),
      this.patientBlocRepo.count({
        where: { ...actifs, niveauUrgence: 'URGENT' as any },
      }),
      this.scoreRepo.count(),
      this.patientBlocRepo
        .createQueryBuilder('p')
        .select('p.statut, COUNT(*) as count')
        .groupBy('p.statut')
        .getRawMany(),
      this.patientBlocRepo
        .createQueryBuilder('p')
        .select('p.niveauUrgence, COUNT(*) as count')
        .where('p.statut != :sorti', { sorti: 'SORTI' })
        .groupBy('p.niveauUrgence')
        .getRawMany(),
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
    const whereAct =
      dateDebut && dateFin
        ? { dateOperation: Between(new Date(dateDebut), new Date(dateFin)) }
        : {};
    const rows = await this.activiteRepo
      .createQueryBuilder('a')
      .select('a.chirurgienId', 'medecinId')
      .addSelect('COUNT(*)', 'nbOperations')
      .where(whereAct)
      .andWhere('a.chirurgienId IS NOT NULL')
      .groupBy('a.chirurgienId')
      .orderBy('nbOperations', 'DESC')
      .getRawMany();
    const identites = await this.medecinIdentiteService.resoudreLot(
      rows.map((r) => r.medecinId),
    );
    return rows.map((r) => {
      const identite = identites[r.medecinId];
      return {
        ...r,
        nomComplet: identite ? `${identite.prenom} ${identite.nom}` : '—',
      };
    });
  }

  // Activité par anesthésiste : combine les CPA réalisées, les scores de réveil évalués et les
  // opérations suivies — les trois actes cliniques distincts que l'anesthésiste réalise le long
  // du parcours patient (miroir de la gestion des rôles CPA/pendant l'opération/salle de réveil).
  async activiteParAnesthesiste(dateDebut?: string, dateFin?: string) {
    const periodeCPA =
      dateDebut && dateFin
        ? { dateConsultation: Between(new Date(dateDebut), new Date(dateFin)) }
        : {};
    const periodeAct =
      dateDebut && dateFin
        ? { dateOperation: Between(new Date(dateDebut), new Date(dateFin)) }
        : {};

    const [
      cpaParAnesthesiste,
      operationsParAnesthesiste,
      scoresParAnesthesiste,
    ] = await Promise.all([
      this.cpaRepository
        .createQueryBuilder('c')
        .select('c.anesthesisteId', 'medecinId')
        .addSelect('COUNT(*)', 'nb')
        .where(periodeCPA)
        .groupBy('c.anesthesisteId')
        .getRawMany(),
      this.activiteRepo
        .createQueryBuilder('a')
        .select('a.anesthesisteId', 'medecinId')
        .addSelect('COUNT(*)', 'nb')
        .where(periodeAct)
        .andWhere('a.anesthesisteId IS NOT NULL')
        .groupBy('a.anesthesisteId')
        .getRawMany(),
      this.scoreRepo
        .createQueryBuilder('s')
        .select('s.anesthesisteId', 'medecinId')
        .addSelect('COUNT(*)', 'nb')
        .groupBy('s.anesthesisteId')
        .getRawMany(),
    ]);

    const tousLesIds = [
      ...cpaParAnesthesiste,
      ...operationsParAnesthesiste,
      ...scoresParAnesthesiste,
    ].map((r: any) => r.medecinId);
    const identites = await this.medecinIdentiteService.resoudreLot(tousLesIds);
    const nomComplet = (id: string) => {
      const identite = identites[id];
      return identite ? `${identite.prenom} ${identite.nom}` : '—';
    };

    const parId = new Map<
      string,
      {
        medecinId: string;
        nomComplet: string;
        nbCPA: number;
        nbOperations: number;
        nbScoresSCCRE: number;
      }
    >();
    const assurer = (id: string) => {
      if (!parId.has(id))
        parId.set(id, {
          medecinId: id,
          nomComplet: nomComplet(id),
          nbCPA: 0,
          nbOperations: 0,
          nbScoresSCCRE: 0,
        });
      return parId.get(id)!;
    };
    cpaParAnesthesiste.forEach((r: any) => {
      if (r.medecinId) assurer(r.medecinId).nbCPA = Number(r.nb);
    });
    operationsParAnesthesiste.forEach((r: any) => {
      if (r.medecinId) assurer(r.medecinId).nbOperations = Number(r.nb);
    });
    scoresParAnesthesiste.forEach((r: any) => {
      if (r.medecinId) assurer(r.medecinId).nbScoresSCCRE = Number(r.nb);
    });

    return Array.from(parId.values()).sort(
      (a, b) =>
        b.nbCPA +
        b.nbOperations +
        b.nbScoresSCCRE -
        (a.nbCPA + a.nbOperations + a.nbScoresSCCRE),
    );
  }

  async decisionsCPA(dateDebut?: string, dateFin?: string) {
    const periode =
      dateDebut && dateFin
        ? { dateConsultation: Between(new Date(dateDebut), new Date(dateFin)) }
        : {};
    return this.cpaRepository
      .createQueryBuilder('c')
      .select('c.decision', 'decision')
      .addSelect('COUNT(*)', 'count')
      .where(periode)
      .groupBy('c.decision')
      .getRawMany();
  }

  async typesChirurgie() {
    return this.patientBlocRepo
      .createQueryBuilder('p')
      .select("COALESCE(p.typeChirurgie, 'Non spécifié')", 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('p.typeChirurgie')
      .orderBy('count', 'DESC')
      .getRawMany();
  }

  async tachesAccomplies(dateDebut?: string, dateFin?: string) {
    const periode =
      dateDebut && dateFin
        ? { dateCreation: Between(new Date(dateDebut), new Date(dateFin)) }
        : {};
    const periodeProtocole =
      dateDebut && dateFin
        ? { dateOperation: Between(new Date(dateDebut), new Date(dateFin)) }
        : {};
    const [signIn, timeOut, signOut, moments, comptesRendus] =
      await Promise.all([
        this.checklistAvantRepo.count({ where: periode }),
        this.checklistPendantRepo.count({ where: periode }),
        this.checklistApresRepo.count({ where: periode }),
        this.momentRepo.count({ where: { annule: false } }),
        this.protocoleRepo.count({ where: periodeProtocole }),
      ]);
    return {
      checklistsAvantOp: signIn,
      checklistsPendantOp: timeOut,
      checklistsApresOp: signOut,
      momentsOperatoires: moments,
      comptesRendusOperatoires: comptesRendus,
    };
  }

  async cpaEnAttente() {
    const data = await this.notifRepo.find({
      where: { statut: 'EN_ATTENTE' as any },
      order: { createdAt: 'ASC' },
    });
    const enrichedPatient = await this.accueilClient.enrichWithIdentity(data);
    return this.medecinIdentiteService.enrichir(
      enrichedPatient,
      'chirurgienId',
      'chirurgien',
    );
  }

  async tauxOccupation(dateDebut?: string, dateFin?: string) {
    const qb = this.activiteRepo
      .createQueryBuilder('a')
      .select('DATE(a.dateOperation)', 'date')
      .addSelect('COUNT(*)', 'nbOperations')
      .groupBy('DATE(a.dateOperation)')
      .orderBy('date', 'ASC');
    if (dateDebut && dateFin)
      qb.where('a.dateOperation BETWEEN :debut AND :fin', {
        debut: dateDebut,
        fin: dateFin,
      });
    return qb.getRawMany();
  }

  // Liste détaillée des opérations (identité patient enrichie), pour le tableau "détail" du
  // rapport et ses exports — bornée pour rester exploitable à l'écran.
  async operationsDetail(dateDebut?: string, dateFin?: string, limite = 300) {
    const whereAct =
      dateDebut && dateFin
        ? { dateOperation: Between(new Date(dateDebut), new Date(dateFin)) }
        : {};
    const activites = await this.activiteRepo.find({
      where: whereAct,
      order: { dateOperation: 'DESC' },
      take: limite,
    });
    const patientIds = Array.from(new Set(activites.map((a) => a.patientId)));
    const [patients, protocoles, identitesChirurgien, identitesAnesthesiste] =
      await Promise.all([
        patientIds.length
          ? this.patientBlocRepo.findBy({ patientId: In(patientIds) })
          : Promise.resolve([]),
        patientIds.length
          ? this.protocoleRepo.findBy({ patientId: In(patientIds) })
          : Promise.resolve([]),
        this.medecinIdentiteService.resoudreLot(
          activites.map((a) => a.chirurgienId),
        ),
        this.medecinIdentiteService.resoudreLot(
          activites.map((a) => a.anesthesisteId),
        ),
      ]);
    // Identité (nom/prénom) enrichie depuis Accueil — jamais l'ID affiché à la place côté front.
    let patientsEnrichis: any[] = patients;
    try {
      patientsEnrichis = await this.accueilClient.enrichWithIdentity(patients);
    } catch {
      // dégradé vers les données non enrichies
    }
    const patientMap = new Map(patientsEnrichis.map((p) => [p.patientId, p]));
    const patientsAvecCompteRendu = new Set(protocoles.map((p) => p.patientId));

    return activites.map((a) => {
      const patient = patientMap.get(a.patientId);
      const chirurgien = a.chirurgienId
        ? identitesChirurgien[a.chirurgienId]
        : null;
      const anesthesiste = a.anesthesisteId
        ? identitesAnesthesiste[a.anesthesisteId]
        : null;
      return {
        patientNom: patient?.nom
          ? `${patient.nom}${patient.prenom ? ' ' + patient.prenom : ''}`
          : 'Patient inconnu',
        libelle: patient?.libelle || '—',
        typeChirurgie: patient?.typeChirurgie || '—',
        niveauUrgence: patient?.niveauUrgence || '—',
        statut: patient?.statut || '—',
        dateOperation: a.dateOperation,
        chirurgien: chirurgien ? `${chirurgien.prenom} ${chirurgien.nom}` : '—',
        anesthesiste: anesthesiste
          ? `${anesthesiste.prenom} ${anesthesiste.nom}`
          : '—',
        compteRenduDisponible: patientsAvecCompteRendu.has(a.patientId),
      };
    });
  }

  // Point d'entrée unique du dashboard Rapport : agrège tout ce qui précède en un seul appel,
  // filtré sur la même période, pour éviter les incohérences entre widgets et limiter le nombre
  // de requêtes réseau du frontend.
  async tableauDeBord(dateDebut?: string, dateFin?: string) {
    const [
      statistiques,
      activiteParChirurgien,
      activiteParAnesthesiste,
      decisionsCPA,
      typesChirurgie,
      tachesAccomplies,
      evolutionQuotidienne,
      operationsDetail,
      sortiesReveil,
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
