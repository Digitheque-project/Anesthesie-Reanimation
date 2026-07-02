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
var DemandeCpaExterneService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemandeCpaExterneService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const typeorm_2 = require("typeorm");
const demande_cpa_externe_entity_1 = require("../entities/demande-cpa-externe.entity");
let DemandeCpaExterneService = DemandeCpaExterneService_1 = class DemandeCpaExterneService {
    repo;
    config;
    logger = new common_1.Logger(DemandeCpaExterneService_1.name);
    constructor(repo, config) {
        this.repo = repo;
        this.config = config;
    }
    async receive(dto) {
        const demande = this.repo.create({
            ...dto,
            dateExamenSouhaitee: dto.dateExamenSouhaitee ? new Date(dto.dateExamenSouhaitee) : undefined,
            chuId: this.config.get('externalServices.chuId'),
            statut: demande_cpa_externe_entity_1.StatutDemandeCpaExterne.EN_ATTENTE,
            payload: dto,
        });
        const saved = await this.repo.save(demande);
        this.logger.log(`📋 Demande de CPA externe reçue pour patient ${dto.patientId} (source: ${dto.sourceServiceName || dto.sourceServiceId})`);
        return saved;
    }
    async findAll(statut) {
        return this.repo.find({ where: statut ? { statut } : {}, order: { createdAt: 'DESC' } });
    }
    async findOne(id) {
        const demande = await this.repo.findOne({ where: { id } });
        if (!demande)
            throw new common_1.NotFoundException(`Demande de CPA externe ${id} non trouvée`);
        return demande;
    }
    async update(id, dto) {
        const demande = await this.findOne(id);
        Object.assign(demande, {
            ...dto,
            dateCpaPlanifiee: dto.dateCpaPlanifiee ? new Date(dto.dateCpaPlanifiee) : demande.dateCpaPlanifiee,
            dateVpaPlanifiee: dto.dateVpaPlanifiee ? new Date(dto.dateVpaPlanifiee) : demande.dateVpaPlanifiee,
        });
        return this.repo.save(demande);
    }
    async trouverDemandeOuverte(patientId) {
        return this.repo.findOne({
            where: {
                patientId,
                statut: (0, typeorm_2.In)([demande_cpa_externe_entity_1.StatutDemandeCpaExterne.EN_ATTENTE, demande_cpa_externe_entity_1.StatutDemandeCpaExterne.CPA_PLANIFIEE, demande_cpa_externe_entity_1.StatutDemandeCpaExterne.VPA_PLANIFIEE, demande_cpa_externe_entity_1.StatutDemandeCpaExterne.CPA_REALISEE]),
            },
            order: { createdAt: 'DESC' },
        });
    }
    async marquerCpaRealisee(demande, cpaId, apte) {
        demande.cpaId = cpaId;
        demande.statut = apte ? demande_cpa_externe_entity_1.StatutDemandeCpaExterne.CPA_REALISEE : demande_cpa_externe_entity_1.StatutDemandeCpaExterne.REPORTEE;
        return this.repo.save(demande);
    }
    async marquerVpaRealisee(demande, vpaId) {
        demande.vpaId = vpaId;
        demande.statut = demande_cpa_externe_entity_1.StatutDemandeCpaExterne.CONFIRMEE;
        return this.repo.save(demande);
    }
};
exports.DemandeCpaExterneService = DemandeCpaExterneService;
exports.DemandeCpaExterneService = DemandeCpaExterneService = DemandeCpaExterneService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(demande_cpa_externe_entity_1.DemandeCpaExterne)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], DemandeCpaExterneService);
//# sourceMappingURL=demande-cpa-externe.service.js.map