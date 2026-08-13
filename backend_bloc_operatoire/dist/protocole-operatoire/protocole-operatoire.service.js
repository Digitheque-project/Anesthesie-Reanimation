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
exports.ProtocoleOperatoireService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const protocole_operatoire_entity_1 = require("../entities/protocole-operatoire.entity");
const drainage_entity_1 = require("../entities/drainage.entity");
const accueil_client_1 = require("../external/accueil.client");
const medecin_identite_service_1 = require("../medecin/medecin-identite.service");
const operation_gateway_1 = require("../operation-gateway/operation.gateway");
const tracabilite_service_1 = require("../tracabilite/tracabilite.service");
const role_clinique_1 = require("../central-auth/role-clinique");
const INTERVENANTS = [
    ['chirurgienId', 'chirurgien'],
    ['anesthesisteId', 'anesthesiste'],
    ['infirmiereId', 'infirmiere'],
    ['aideOperatoireId', 'aideOperatoire'],
];
let ProtocoleOperatoireService = class ProtocoleOperatoireService {
    repo;
    drainageRepo;
    accueilClient;
    medecinIdentiteService;
    gateway;
    tracabiliteService;
    constructor(repo, drainageRepo, accueilClient, medecinIdentiteService, gateway, tracabiliteService) {
        this.repo = repo;
        this.drainageRepo = drainageRepo;
        this.accueilClient = accueilClient;
        this.medecinIdentiteService = medecinIdentiteService;
        this.gateway = gateway;
        this.tracabiliteService = tracabiliteService;
    }
    async create(dto, centralUser) {
        const { drainages, ...data } = dto;
        const role = centralUser ? (0, role_clinique_1.matchRoleClinique)(centralUser.role) : null;
        if ((0, role_clinique_1.agitCommeAnesthesiste)(role))
            data.anesthesisteId = centralUser.userId;
        const existant = data.patientId && data.dateOperation
            ? await this.repo.findOne({
                where: { patientId: data.patientId, dateOperation: data.dateOperation },
            })
            : null;
        let saved;
        if (existant) {
            saved = await this.repo.save(Object.assign(existant, data));
        }
        else {
            const proto = this.repo.create(data);
            const protoSaved = await this.repo.save(proto);
            saved = Array.isArray(protoSaved) ? protoSaved[0] : protoSaved;
        }
        if (drainages?.length)
            await this.drainageRepo.save(drainages.map((d) => this.drainageRepo.create({ ...d, protocole: saved })));
        const complet = await this.findOne(saved.id);
        await this.tracabiliteService.log('ProtocoleOperatoire', saved.id, 'CREATE', { patientId: complet.patientId }, centralUser?.userId);
        this.gateway.emitToOperation(complet.patientId, 'protocole-operatoire:maj', { patientId: complet.patientId, protocole: complet });
        return complet;
    }
    async findAll(page = 1, limite = 10, patientId) {
        const [data, total] = await this.repo.findAndCount({
            where: patientId ? { patientId } : {},
            relations: ['drainages'],
            skip: (page - 1) * limite,
            take: limite,
            order: { createdAt: 'DESC' },
        });
        const enrichedPatient = await this.accueilClient.enrichWithIdentity(data);
        const enriched = await this.medecinIdentiteService.enrichirPlusieurs(enrichedPatient, INTERVENANTS);
        return { data: enriched, total, page, pages: Math.ceil(total / limite) };
    }
    async findOne(id) {
        const p = await this.repo.findOne({
            where: { id },
            relations: ['drainages'],
        });
        if (!p)
            throw new common_1.NotFoundException(`Protocole ${id} non trouvé`);
        const [enrichedPatient] = await this.accueilClient.enrichWithIdentity([p]);
        const [enriched] = await this.medecinIdentiteService.enrichirPlusieurs([enrichedPatient], INTERVENANTS);
        return enriched;
    }
    async update(id, dto, centralUser) {
        const p = await this.repo.findOne({ where: { id } });
        if (!p)
            throw new common_1.NotFoundException(`Protocole ${id} non trouvé`);
        const { drainages, ...data } = dto;
        const role = centralUser ? (0, role_clinique_1.matchRoleClinique)(centralUser.role) : null;
        if ((0, role_clinique_1.agitCommeAnesthesiste)(role))
            data.anesthesisteId = centralUser.userId;
        const updated = await this.repo.save(Object.assign(p, data));
        if (drainages !== undefined) {
            await this.drainageRepo.delete({ protocole: { id } });
            if (drainages.length)
                await this.drainageRepo.save(drainages.map((d) => this.drainageRepo.create({ ...d, protocole: updated })));
        }
        const complet = await this.findOne(updated.id);
        await this.tracabiliteService.log('ProtocoleOperatoire', id, 'UPDATE', { patientId: complet.patientId }, centralUser?.userId);
        this.gateway.emitToOperation(complet.patientId, 'protocole-operatoire:maj', { patientId: complet.patientId, protocole: complet });
        return complet;
    }
    async remove(id) {
        const p = await this.repo.findOne({ where: { id } });
        if (!p)
            throw new common_1.NotFoundException(`Protocole ${id} non trouvé`);
        await this.repo.delete(id);
        return { message: 'Protocole supprimé' };
    }
};
exports.ProtocoleOperatoireService = ProtocoleOperatoireService;
exports.ProtocoleOperatoireService = ProtocoleOperatoireService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(protocole_operatoire_entity_1.ProtocoleOperatoire)),
    __param(1, (0, typeorm_1.InjectRepository)(drainage_entity_1.Drainage)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        accueil_client_1.AccueilClient,
        medecin_identite_service_1.MedecinIdentiteService,
        operation_gateway_1.OperationGateway,
        tracabilite_service_1.TracabiliteService])
], ProtocoleOperatoireService);
//# sourceMappingURL=protocole-operatoire.service.js.map