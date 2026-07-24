"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RapportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const patient_bloc_entity_1 = require("../entities/patient-bloc.entity");
const activite_per_op_entity_1 = require("../entities/activite-per-op.entity");
const score_sccre_entity_1 = require("../entities/score-sccre.entity");
const medecin_entity_1 = require("../entities/medecin.entity");
const cpa_entity_1 = require("../entities/cpa.entity");
const notification_cpa_entity_1 = require("../entities/notification-cpa.entity");
const sortie_reveil_entity_1 = require("../entities/sortie-reveil.entity");
const checklist_avant_op_entity_1 = require("../entities/checklist-avant-op.entity");
const checklist_pendant_op_entity_1 = require("../entities/checklist-pendant-op.entity");
const checklist_apres_op_entity_1 = require("../entities/checklist-apres-op.entity");
const moment_operatoire_entity_1 = require("../entities/moment-operatoire.entity");
const protocole_operatoire_entity_1 = require("../entities/protocole-operatoire.entity");
const accueil_client_1 = require("../external/accueil.client");
const medecin_identite_service_1 = require("../medecin/medecin-identite.service");
let RapportsService = class RapportsService {
    patientBlocRepo;
    activiteRepo;
    scoreRepo;
    medecinRepo;
    cpaRepository;
    notifRepo;
    sortieRepo;
    checklistAvantRepo;
    checklistPendantRepo;
    checklistApresRepo;
    momentRepo;
    protocoleRepo;
    accueilClient;
    medecinIdentiteService;
    constructor(patientBlocRepo, activiteRepo, scoreRepo, medecinRepo, cpaRepository, notifRepo, sortieRepo, checklistAvantRepo, checklistPendantRepo, checklistApresRepo, momentRepo, protocoleRepo, accueilClient, medecinIdentiteService) {
        this.patientBlocRepo = patientBlocRepo;
        this.activiteRepo = activiteRepo;
        this.scoreRepo = scoreRepo;
        this.medecinRepo = medecinRepo;
        this.cpaRepository = cpaRepository;
        this.notifRepo = notifRepo;
        this.sortieRepo = sortieRepo;
        this.checklistAvantRepo = checklistAvantRepo;
        this.checklistPendantRepo = checklistPendantRepo;
        this.checklistApresRepo = checklistApresRepo;
        this.momentRepo = momentRepo;
        this.protocoleRepo = protocoleRepo;
        this.accueilClient = accueilClient;
        this.medecinIdentiteService = medecinIdentiteService;
    }
    async statistiquesGenerales(dateDebut, dateFin) {
        const whereAct = dateDebut && dateFin
            ? { dateOperation: (0, typeorm_2.Between)(new Date(dateDebut), new Date(dateFin)) }
            : {};
        const actifs = { statut: (0, typeorm_2.Not)('SORTI') };
        const [totalPatients, totalPatientsActifs, totalOperations, totalUrgences, totalScores, patientsParStatut, urgencesParNiveau, totalMedecins,] = await Promise.all([
            this.patientBlocRepo.count(),
            this.patientBlocRepo.count({ where: actifs }),
            this.activiteRepo.count({ where: whereAct }),
            this.patientBlocRepo.count({
                where: { ...actifs, niveauUrgence: 'URGENT' },
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
    async activiteParChirurgien(dateDebut, dateFin) {
        const whereAct = dateDebut && dateFin
            ? { dateOperation: (0, typeorm_2.Between)(new Date(dateDebut), new Date(dateFin)) }
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
        const identites = await this.medecinIdentiteService.resoudreLot(rows.map((r) => r.medecinId));
        return rows.map((r) => {
            const identite = identites[r.medecinId];
            return {
                ...r,
                nomComplet: identite ? `${identite.prenom} ${identite.nom}` : '—',
            };
        });
    }
    async activiteParAnesthesiste(dateDebut, dateFin) {
        const periodeCPA = dateDebut && dateFin
            ? { dateConsultation: (0, typeorm_2.Between)(new Date(dateDebut), new Date(dateFin)) }
            : {};
        const periodeAct = dateDebut && dateFin
            ? { dateOperation: (0, typeorm_2.Between)(new Date(dateDebut), new Date(dateFin)) }
            : {};
        const [cpaParAnesthesiste, operationsParAnesthesiste, scoresParAnesthesiste,] = await Promise.all([
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
        ].map((r) => r.medecinId);
        const identites = await this.medecinIdentiteService.resoudreLot(tousLesIds);
        const nomComplet = (id) => {
            const identite = identites[id];
            return identite ? `${identite.prenom} ${identite.nom}` : '—';
        };
        const parId = new Map();
        const assurer = (id) => {
            if (!parId.has(id))
                parId.set(id, {
                    medecinId: id,
                    nomComplet: nomComplet(id),
                    nbCPA: 0,
                    nbOperations: 0,
                    nbScoresSCCRE: 0,
                });
            return parId.get(id);
        };
        cpaParAnesthesiste.forEach((r) => {
            if (r.medecinId)
                assurer(r.medecinId).nbCPA = Number(r.nb);
        });
        operationsParAnesthesiste.forEach((r) => {
            if (r.medecinId)
                assurer(r.medecinId).nbOperations = Number(r.nb);
        });
        scoresParAnesthesiste.forEach((r) => {
            if (r.medecinId)
                assurer(r.medecinId).nbScoresSCCRE = Number(r.nb);
        });
        return Array.from(parId.values()).sort((a, b) => b.nbCPA +
            b.nbOperations +
            b.nbScoresSCCRE -
            (a.nbCPA + a.nbOperations + a.nbScoresSCCRE));
    }
    async decisionsCPA(dateDebut, dateFin) {
        const periode = dateDebut && dateFin
            ? { dateConsultation: (0, typeorm_2.Between)(new Date(dateDebut), new Date(dateFin)) }
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
    async tachesAccomplies(dateDebut, dateFin) {
        const periode = dateDebut && dateFin
            ? { dateCreation: (0, typeorm_2.Between)(new Date(dateDebut), new Date(dateFin)) }
            : {};
        const periodeProtocole = dateDebut && dateFin
            ? { dateOperation: (0, typeorm_2.Between)(new Date(dateDebut), new Date(dateFin)) }
            : {};
        const [signIn, timeOut, signOut, moments, comptesRendus] = await Promise.all([
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
            where: { statut: 'EN_ATTENTE' },
            order: { createdAt: 'ASC' },
        });
        const enrichedPatient = await this.accueilClient.enrichWithIdentity(data);
        return this.medecinIdentiteService.enrichir(enrichedPatient, 'chirurgienId', 'chirurgien');
    }
    async tauxOccupation(dateDebut, dateFin) {
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
    async operationsDetail(dateDebut, dateFin, limite = 300) {
        const whereAct = dateDebut && dateFin
            ? { dateOperation: (0, typeorm_2.Between)(new Date(dateDebut), new Date(dateFin)) }
            : {};
        const activites = await this.activiteRepo.find({
            where: whereAct,
            order: { dateOperation: 'DESC' },
            take: limite,
        });
        const patientIds = Array.from(new Set(activites.map((a) => a.patientId)));
        const [patients, protocoles, identitesChirurgien, identitesAnesthesiste] = await Promise.all([
            patientIds.length
                ? this.patientBlocRepo.findBy({ patientId: (0, typeorm_2.In)(patientIds) })
                : Promise.resolve([]),
            patientIds.length
                ? this.protocoleRepo.findBy({ patientId: (0, typeorm_2.In)(patientIds) })
                : Promise.resolve([]),
            this.medecinIdentiteService.resoudreLot(activites.map((a) => a.chirurgienId)),
            this.medecinIdentiteService.resoudreLot(activites.map((a) => a.anesthesisteId)),
        ]);
        let patientsEnrichis = patients;
        try {
            patientsEnrichis = await this.accueilClient.enrichWithIdentity(patients);
        }
        catch {
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
    async tableauDeBord(dateDebut, dateFin) {
        const [statistiques, activiteParChirurgien, activiteParAnesthesiste, decisionsCPA, typesChirurgie, tachesAccomplies, evolutionQuotidienne, operationsDetail, sortiesReveil,] = await Promise.all([
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
    async exportStatistiques(type, dateDebut, dateFin) {
        return this.tableauDeBord(dateDebut, dateFin);
    }
};
exports.RapportsService = RapportsService;
exports.RapportsService = RapportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(patient_bloc_entity_1.PatientBloc)),
    __param(1, (0, typeorm_1.InjectRepository)(activite_per_op_entity_1.ActivitePerOp)),
    __param(2, (0, typeorm_1.InjectRepository)(score_sccre_entity_1.ScoreSCCRE)),
    __param(3, (0, typeorm_1.InjectRepository)(medecin_entity_1.Medecin)),
    __param(4, (0, typeorm_1.InjectRepository)(cpa_entity_1.CPA)),
    __param(5, (0, typeorm_1.InjectRepository)(notification_cpa_entity_1.NotificationCPA)),
    __param(6, (0, typeorm_1.InjectRepository)(sortie_reveil_entity_1.SortieReveil)),
    __param(7, (0, typeorm_1.InjectRepository)(checklist_avant_op_entity_1.ChecklistAvantOp)),
    __param(8, (0, typeorm_1.InjectRepository)(checklist_pendant_op_entity_1.ChecklistPendantOp)),
    __param(9, (0, typeorm_1.InjectRepository)(checklist_apres_op_entity_1.ChecklistApresOp)),
    __param(10, (0, typeorm_1.InjectRepository)(moment_operatoire_entity_1.MomentOperatoire)),
    __param(11, (0, typeorm_1.InjectRepository)(protocole_operatoire_entity_1.ProtocoleOperatoire)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        accueil_client_1.AccueilClient,
        medecin_identite_service_1.MedecinIdentiteService])
], RapportsService);
//# sourceMappingURL=rapports.service.js.map