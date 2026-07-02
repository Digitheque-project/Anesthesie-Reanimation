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
exports.ArchivesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const patient_bloc_entity_1 = require("../entities/patient-bloc.entity");
const cpa_entity_1 = require("../entities/cpa.entity");
const vpa_entity_1 = require("../entities/vpa.entity");
const bon_commande_anesthesie_entity_1 = require("../entities/bon-commande-anesthesie.entity");
const activite_per_op_entity_1 = require("../entities/activite-per-op.entity");
const protocole_operatoire_entity_1 = require("../entities/protocole-operatoire.entity");
const score_sccre_entity_1 = require("../entities/score-sccre.entity");
const sortie_reveil_entity_1 = require("../entities/sortie-reveil.entity");
const checklist_avant_op_entity_1 = require("../entities/checklist-avant-op.entity");
const checklist_pendant_op_entity_1 = require("../entities/checklist-pendant-op.entity");
const checklist_apres_op_entity_1 = require("../entities/checklist-apres-op.entity");
const accueil_client_1 = require("../external/accueil.client");
let ArchivesService = class ArchivesService {
    patientBlocRepo;
    cpaRepository;
    vpaRepository;
    bonRepo;
    activiteRepo;
    protocoleRepo;
    scoreRepo;
    sortieRepo;
    checklistAvantRepo;
    checklistPendantRepo;
    checklistApresRepo;
    accueilClient;
    constructor(patientBlocRepo, cpaRepository, vpaRepository, bonRepo, activiteRepo, protocoleRepo, scoreRepo, sortieRepo, checklistAvantRepo, checklistPendantRepo, checklistApresRepo, accueilClient) {
        this.patientBlocRepo = patientBlocRepo;
        this.cpaRepository = cpaRepository;
        this.vpaRepository = vpaRepository;
        this.bonRepo = bonRepo;
        this.activiteRepo = activiteRepo;
        this.protocoleRepo = protocoleRepo;
        this.scoreRepo = scoreRepo;
        this.sortieRepo = sortieRepo;
        this.checklistAvantRepo = checklistAvantRepo;
        this.checklistPendantRepo = checklistPendantRepo;
        this.checklistApresRepo = checklistApresRepo;
        this.accueilClient = accueilClient;
    }
    async getPatientEnrichi(patientId) {
        const suivi = await this.patientBlocRepo.findOne({ where: { patientId } });
        if (!suivi)
            throw new common_1.NotFoundException('Patient non trouvé');
        const identite = await this.accueilClient.getPatient(patientId);
        return { ...suivi, ...identite, patientId };
    }
    async getDossierComplet(patientId) {
        const patient = await this.getPatientEnrichi(patientId);
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
    async getResumePatient(patientId) {
        const patient = await this.getPatientEnrichi(patientId);
        const nbInterventions = await this.activiteRepo.count({ where: { patientId } });
        const dernierScore = await this.scoreRepo.findOne({ where: { patientId }, order: { createdAt: 'DESC' } });
        return { patient, nombreInterventions: nbInterventions, dernierScoreSCCRE: dernierScore?.scoreTotal || null, statutActuel: patient.statut };
    }
};
exports.ArchivesService = ArchivesService;
exports.ArchivesService = ArchivesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(patient_bloc_entity_1.PatientBloc)),
    __param(1, (0, typeorm_1.InjectRepository)(cpa_entity_1.CPA)),
    __param(2, (0, typeorm_1.InjectRepository)(vpa_entity_1.VPA)),
    __param(3, (0, typeorm_1.InjectRepository)(bon_commande_anesthesie_entity_1.BonCommandeAnesthesie)),
    __param(4, (0, typeorm_1.InjectRepository)(activite_per_op_entity_1.ActivitePerOp)),
    __param(5, (0, typeorm_1.InjectRepository)(protocole_operatoire_entity_1.ProtocoleOperatoire)),
    __param(6, (0, typeorm_1.InjectRepository)(score_sccre_entity_1.ScoreSCCRE)),
    __param(7, (0, typeorm_1.InjectRepository)(sortie_reveil_entity_1.SortieReveil)),
    __param(8, (0, typeorm_1.InjectRepository)(checklist_avant_op_entity_1.ChecklistAvantOp)),
    __param(9, (0, typeorm_1.InjectRepository)(checklist_pendant_op_entity_1.ChecklistPendantOp)),
    __param(10, (0, typeorm_1.InjectRepository)(checklist_apres_op_entity_1.ChecklistApresOp)),
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
        accueil_client_1.AccueilClient])
], ArchivesService);
//# sourceMappingURL=archives.service.js.map