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
const operation_gateway_1 = require("../operation-gateway/operation.gateway");
let ProtocoleOperatoireService = class ProtocoleOperatoireService {
    repo;
    drainageRepo;
    accueilClient;
    gateway;
    constructor(repo, drainageRepo, accueilClient, gateway) {
        this.repo = repo;
        this.drainageRepo = drainageRepo;
        this.accueilClient = accueilClient;
        this.gateway = gateway;
    }
    async create(dto) {
        const { drainages, ...data } = dto;
        const proto = this.repo.create(data);
        const protoSaved = await this.repo.save(proto);
        const saved = Array.isArray(protoSaved) ? protoSaved[0] : protoSaved;
        if (drainages?.length)
            await this.drainageRepo.save(drainages.map((d) => this.drainageRepo.create({ ...d, protocole: saved })));
        const complet = await this.findOne(saved.id);
        this.gateway.emitToOperation(complet.patientId, 'protocole-operatoire:maj', { patientId: complet.patientId, protocole: complet });
        return complet;
    }
    async findAll(page = 1, limite = 10, patientId) {
        const [data, total] = await this.repo.findAndCount({
            where: patientId ? { patientId } : {},
            relations: ['chirurgien', 'anesthesiste', 'infirmiere', 'aideOperatoire', 'drainages'],
            skip: (page - 1) * limite, take: limite, order: { createdAt: 'DESC' },
        });
        const enriched = await this.accueilClient.enrichWithIdentity(data);
        return { data: enriched, total, page, pages: Math.ceil(total / limite) };
    }
    async findOne(id) {
        const p = await this.repo.findOne({ where: { id }, relations: ['chirurgien', 'anesthesiste', 'infirmiere', 'aideOperatoire', 'drainages'] });
        if (!p)
            throw new common_1.NotFoundException(`Protocole ${id} non trouvé`);
        const [enriched] = await this.accueilClient.enrichWithIdentity([p]);
        return enriched;
    }
    async update(id, dto) {
        const p = await this.repo.findOne({ where: { id } });
        if (!p)
            throw new common_1.NotFoundException(`Protocole ${id} non trouvé`);
        const updated = await this.repo.save(Object.assign(p, dto));
        this.gateway.emitToOperation(updated.patientId, 'protocole-operatoire:maj', { patientId: updated.patientId, protocole: updated });
        return updated;
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
        operation_gateway_1.OperationGateway])
], ProtocoleOperatoireService);
//# sourceMappingURL=protocole-operatoire.service.js.map