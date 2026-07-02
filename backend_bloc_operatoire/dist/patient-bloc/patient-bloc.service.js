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
exports.PatientBlocService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const typeorm_2 = require("typeorm");
const patient_bloc_entity_1 = require("../entities/patient-bloc.entity");
const accueil_client_1 = require("../external/accueil.client");
let PatientBlocService = class PatientBlocService {
    patientBlocRepo;
    accueilClient;
    config;
    constructor(patientBlocRepo, accueilClient, config) {
        this.patientBlocRepo = patientBlocRepo;
        this.accueilClient = accueilClient;
        this.config = config;
    }
    async search(q) {
        return this.accueilClient.searchPatients(q ?? '');
    }
    async getExternal(externalId) {
        const patient = await this.accueilClient.getPatient(externalId);
        if (!patient)
            throw new common_1.NotFoundException(`Patient ${externalId} introuvable dans le service Accueil`);
        return patient;
    }
    async admitExisting(dto) {
        const external = await this.accueilClient.getPatient(dto.patientId);
        if (!external)
            throw new common_1.NotFoundException(`Patient ${dto.patientId} introuvable dans le service Accueil`);
        const existing = await this.patientBlocRepo.findOne({ where: { patientId: dto.patientId } });
        if (existing)
            throw new common_1.ConflictException(`Le patient ${dto.patientId} est déjà admis au bloc`);
        const { patientId, ...operationalFields } = dto;
        const record = this.patientBlocRepo.create({
            ...operationalFields,
            patientId,
            chuId: this.config.get('externalServices.chuId'),
        });
        return this.patientBlocRepo.save(record);
    }
    async registerAndAdmit(dto, createdBy) {
        const external = await this.accueilClient.registerPatient(dto.identite, createdBy);
        const { identite, ...operationalFields } = dto;
        const record = this.patientBlocRepo.create({
            ...operationalFields,
            patientId: external.id,
            chuId: this.config.get('externalServices.chuId'),
        });
        return this.patientBlocRepo.save(record);
    }
    async findAll(filters) {
        const { statut, niveauUrgence, recherche, page = 1, limite = 10 } = filters || {};
        const skip = (page - 1) * limite;
        let where = {};
        if (statut)
            where.statut = statut;
        if (niveauUrgence)
            where.niveauUrgence = niveauUrgence;
        if (recherche)
            where.idDossier = (0, typeorm_2.Like)(`%${recherche}%`);
        const [data, total] = await this.patientBlocRepo.findAndCount({
            where,
            skip,
            take: limite,
            order: { createdAt: 'DESC' },
        });
        const enriched = await this.accueilClient.enrichWithIdentity(data);
        return { data: enriched, total, page, pages: Math.ceil(total / limite) };
    }
    async findOne(patientId) {
        const record = await this.patientBlocRepo.findOne({ where: { patientId } });
        if (!record)
            throw new common_1.NotFoundException(`Fiche de suivi bloc introuvable pour le patient ${patientId}`);
        const [enriched] = await this.accueilClient.enrichWithIdentity([record]);
        return enriched;
    }
    async update(patientId, dto) {
        const record = await this.patientBlocRepo.findOne({ where: { patientId } });
        if (!record)
            throw new common_1.NotFoundException(`Fiche de suivi bloc introuvable pour le patient ${patientId}`);
        Object.assign(record, dto);
        return this.patientBlocRepo.save(record);
    }
    async remove(patientId) {
        const record = await this.patientBlocRepo.findOne({ where: { patientId } });
        if (!record)
            throw new common_1.NotFoundException(`Fiche de suivi bloc introuvable pour le patient ${patientId}`);
        await this.patientBlocRepo.remove(record);
        return { message: 'Fiche de suivi supprimée avec succès' };
    }
};
exports.PatientBlocService = PatientBlocService;
exports.PatientBlocService = PatientBlocService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(patient_bloc_entity_1.PatientBloc)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        accueil_client_1.AccueilClient,
        config_1.ConfigService])
], PatientBlocService);
//# sourceMappingURL=patient-bloc.service.js.map