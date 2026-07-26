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
exports.SortieReveilService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sortie_reveil_entity_1 = require("../entities/sortie-reveil.entity");
const accueil_client_1 = require("../external/accueil.client");
const medecin_identite_service_1 = require("../medecin/medecin-identite.service");
const patient_bloc_statut_service_1 = require("../patient-bloc/patient-bloc-statut.service");
const patient_bloc_entity_1 = require("../entities/patient-bloc.entity");
const tracabilite_service_1 = require("../tracabilite/tracabilite.service");
let SortieReveilService = class SortieReveilService {
    repo;
    accueilClient;
    medecinIdentiteService;
    patientBlocStatutService;
    tracabiliteService;
    constructor(repo, accueilClient, medecinIdentiteService, patientBlocStatutService, tracabiliteService) {
        this.repo = repo;
        this.accueilClient = accueilClient;
        this.medecinIdentiteService = medecinIdentiteService;
        this.patientBlocStatutService = patientBlocStatutService;
        this.tracabiliteService = tracabiliteService;
    }
    async create(dto, centralUser) {
        const saved = await this.repo.save(this.repo.create({ ...dto, medecinId: centralUser.userId }));
        const sortie = Array.isArray(saved) ? saved[0] : saved;
        await this.tracabiliteService.log('SortieReveil', sortie.id, 'CREATE', { patientId: sortie.patientId }, centralUser.userId);
        if (sortie.patientId) {
            await this.patientBlocStatutService.changerStatut(sortie.patientId, patient_bloc_entity_1.PatientStatut.SORTI, centralUser.userId);
        }
        return sortie;
    }
    async findAll(page = 1, limite = 10) {
        const [data, total] = await this.repo.findAndCount({
            relations: ['scoreSCCRE'],
            skip: (page - 1) * limite,
            take: limite,
            order: { createdAt: 'DESC' },
        });
        const enrichedPatient = await this.accueilClient.enrichWithIdentity(data);
        const enriched = await this.medecinIdentiteService.enrichir(enrichedPatient, 'medecinId', 'medecin');
        return { data: enriched, total, page, pages: Math.ceil(total / limite) };
    }
    async findOne(id) {
        const s = await this.repo.findOne({
            where: { id },
            relations: ['scoreSCCRE'],
        });
        if (!s)
            throw new common_1.NotFoundException(`Sortie ${id} non trouvée`);
        const [enrichedPatient] = await this.accueilClient.enrichWithIdentity([s]);
        const [enriched] = await this.medecinIdentiteService.enrichir([enrichedPatient], 'medecinId', 'medecin');
        return enriched;
    }
    async update(id, dto) {
        const s = await this.repo.findOne({ where: { id } });
        if (!s)
            throw new common_1.NotFoundException(`Sortie ${id} non trouvée`);
        return this.repo.save(Object.assign(s, dto));
    }
    async remove(id) {
        const s = await this.repo.findOne({ where: { id } });
        if (!s)
            throw new common_1.NotFoundException(`Sortie ${id} non trouvée`);
        await this.repo.delete(id);
        return { message: 'Sortie supprimée' };
    }
};
exports.SortieReveilService = SortieReveilService;
exports.SortieReveilService = SortieReveilService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sortie_reveil_entity_1.SortieReveil)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        accueil_client_1.AccueilClient,
        medecin_identite_service_1.MedecinIdentiteService,
        patient_bloc_statut_service_1.PatientBlocStatutService,
        tracabilite_service_1.TracabiliteService])
], SortieReveilService);
//# sourceMappingURL=sortie-reveil.service.js.map