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
const accueil_client_1 = require("../external/accueil.client");
let RapportsService = class RapportsService {
    patientBlocRepo;
    activiteRepo;
    scoreRepo;
    medecinRepo;
    cpaRepository;
    notifRepo;
    accueilClient;
    constructor(patientBlocRepo, activiteRepo, scoreRepo, medecinRepo, cpaRepository, notifRepo, accueilClient) {
        this.patientBlocRepo = patientBlocRepo;
        this.activiteRepo = activiteRepo;
        this.scoreRepo = scoreRepo;
        this.medecinRepo = medecinRepo;
        this.cpaRepository = cpaRepository;
        this.notifRepo = notifRepo;
        this.accueilClient = accueilClient;
    }
    async statistiquesGenerales(dateDebut, dateFin) {
        const whereAct = dateDebut && dateFin ? { dateOperation: (0, typeorm_2.Between)(new Date(dateDebut), new Date(dateFin)) } : {};
        const [totalPatients, totalOperations, totalUrgences, totalScores, patientsParStatut, urgencesParNiveau, totalMedecins,] = await Promise.all([
            this.patientBlocRepo.count(),
            this.activiteRepo.count({ where: whereAct }),
            this.patientBlocRepo.count({ where: { niveauUrgence: 'URGENT' } }),
            this.scoreRepo.count(),
            this.patientBlocRepo.createQueryBuilder('p').select('p.statut, COUNT(*) as count').groupBy('p.statut').getRawMany(),
            this.patientBlocRepo.createQueryBuilder('p').select('p.niveauUrgence, COUNT(*) as count').groupBy('p.niveauUrgence').getRawMany(),
            this.medecinRepo.count(),
        ]);
        return {
            totalPatients,
            totalOperations,
            totalUrgences,
            totalScores,
            totalMedecins,
            patientsParStatut,
            urgencesParNiveau,
        };
    }
    async activiteParChirurgien(dateDebut, dateFin) {
        const whereAct = dateDebut && dateFin ? { dateOperation: (0, typeorm_2.Between)(new Date(dateDebut), new Date(dateFin)) } : {};
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
        const data = await this.notifRepo.find({ where: { statut: 'EN_ATTENTE' }, relations: ['chirurgien'], order: { createdAt: 'ASC' } });
        return this.accueilClient.enrichWithIdentity(data);
    }
    async tauxOccupation(periode = 'mois') {
        return this.activiteRepo
            .createQueryBuilder('a')
            .select('DATE(a.dateOperation)', 'date')
            .addSelect('COUNT(*)', 'nbOperations')
            .groupBy('DATE(a.dateOperation)')
            .orderBy('date', 'ASC')
            .getRawMany();
    }
    async exportStatistiques(type, dateDebut, dateFin) {
        const stats = await this.statistiquesGenerales(dateDebut, dateFin);
        const activite = await this.activiteParChirurgien(dateDebut, dateFin);
        return {
            type,
            genereLe: new Date().toISOString(),
            statistiques: stats,
            activiteParChirurgien: activite,
        };
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
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        accueil_client_1.AccueilClient])
], RapportsService);
//# sourceMappingURL=rapports.service.js.map