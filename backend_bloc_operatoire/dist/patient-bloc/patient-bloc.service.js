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
const typeorm_2 = require("typeorm");
const patient_bloc_entity_1 = require("../entities/patient-bloc.entity");
const demande_cpa_externe_entity_1 = require("../entities/demande-cpa-externe.entity");
let PatientBlocService = class PatientBlocService {
    patientRepo;
    demandeRepo;
    constructor(patientRepo, demandeRepo) {
        this.patientRepo = patientRepo;
        this.demandeRepo = demandeRepo;
    }
    async creerDepuisPrescription(demandeId) {
        const demande = await this.demandeRepo.findOne({ where: { id: demandeId } });
        if (!demande)
            throw new Error('Demande non trouvée');
        const estUrgence = demande.urgence !== undefined && demande.urgence >= 3;
        const niveauUrgence = estUrgence ? patient_bloc_entity_1.NiveauUrgence.STAT : patient_bloc_entity_1.NiveauUrgence.NORMAL;
        const statutInitial = estUrgence ? patient_bloc_entity_1.PatientStatut.EN_ATTENTE_VPA : patient_bloc_entity_1.PatientStatut.EN_ATTENTE_CPA;
        const patient = new patient_bloc_entity_1.PatientBloc();
        patient.patientId = demande.patientId;
        patient.chuId = demande.chuId;
        patient.idDossier = `CHU-${Date.now()}`;
        patient.groupeSanguin = 'A+';
        patient.niveauUrgence = niveauUrgence;
        patient.statut = statutInitial;
        patient.prescripteurId = demande.sourceServiceId;
        patient.serviceOrigine = demande.sourceServiceName || null;
        patient.serviceOrigineId = demande.sourceServiceId || null;
        const saved = await this.patientRepo.save(patient);
        return Array.isArray(saved) ? saved[0] : saved;
    }
    estStat(patientId) {
        return false;
    }
    async findAll(filters) {
        const { statut, niveauUrgence, recherche, page = 1, limite = 10 } = filters;
        const qb = this.patientRepo.createQueryBuilder('p');
        if (statut)
            qb.andWhere('p.statut = :statut', { statut });
        if (niveauUrgence)
            qb.andWhere('p.niveauUrgence = :niveauUrgence', { niveauUrgence });
        if (recherche)
            qb.andWhere('p.idDossier ILIKE :recherche', { recherche: `%${recherche}%` });
        qb.orderBy('p.createdAt', 'DESC');
        qb.skip((page - 1) * limite).take(limite);
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, pages: Math.ceil(total / limite) };
    }
    async findOne(patientId) {
        return this.patientRepo.findOne({ where: { patientId } });
    }
    async update(patientId, dto) {
        const patient = await this.patientRepo.findOne({ where: { patientId } });
        if (!patient)
            throw new Error('Patient non trouvé');
        Object.assign(patient, dto);
        const saved = await this.patientRepo.save(patient);
        return Array.isArray(saved) ? saved[0] : saved;
    }
    async remove(patientId) {
        await this.patientRepo.delete(patientId);
        return { message: 'Patient supprimé du bloc' };
    }
    async search(q) {
        return [];
    }
    async getExternal(externalId) {
        return null;
    }
    async admitExisting(dto) {
        const patient = this.patientRepo.create({
            ...dto,
            statut: patient_bloc_entity_1.PatientStatut.EN_ATTENTE_CPA,
            niveauUrgence: dto.niveauUrgence || patient_bloc_entity_1.NiveauUrgence.NORMAL,
        });
        const saved = await this.patientRepo.save(patient);
        return Array.isArray(saved) ? saved[0] : saved;
    }
    async registerAndAdmit(dto, createdBy) {
        const patient = this.patientRepo.create({
            ...dto,
            statut: patient_bloc_entity_1.PatientStatut.EN_ATTENTE_CPA,
            niveauUrgence: dto.niveauUrgence || patient_bloc_entity_1.NiveauUrgence.NORMAL,
        });
        const saved = await this.patientRepo.save(patient);
        return Array.isArray(saved) ? saved[0] : saved;
    }
};
exports.PatientBlocService = PatientBlocService;
exports.PatientBlocService = PatientBlocService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(patient_bloc_entity_1.PatientBloc)),
    __param(1, (0, typeorm_1.InjectRepository)(demande_cpa_externe_entity_1.DemandeCpaExterne)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PatientBlocService);
//# sourceMappingURL=patient-bloc.service.js.map