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
exports.ActivitePerOpService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const activite_per_op_entity_1 = require("../entities/activite-per-op.entity");
const constante_per_op_entity_1 = require("../entities/constante-per-op.entity");
const accueil_client_1 = require("../external/accueil.client");
const operation_gateway_1 = require("../operation-gateway/operation.gateway");
let ActivitePerOpService = class ActivitePerOpService {
    repo;
    constanteRepo;
    accueilClient;
    gateway;
    constructor(repo, constanteRepo, accueilClient, gateway) {
        this.repo = repo;
        this.constanteRepo = constanteRepo;
        this.accueilClient = accueilClient;
        this.gateway = gateway;
    }
    async create(dto) {
        const { constantes, ...data } = dto;
        const activite = this.repo.create(data);
        const activiteSaved = await this.repo.save(activite);
        const saved = Array.isArray(activiteSaved) ? activiteSaved[0] : activiteSaved;
        if (constantes && constantes.length > 0) {
            const constantesEntities = constantes.map(c => this.constanteRepo.create({
                ...c,
                activitePerOp: saved
            }));
            await this.constanteRepo.save(constantesEntities);
            console.log(`✅ ${constantesEntities.length} mesures de constantes enregistrées`);
        }
        return this.findOne(saved.id);
    }
    async findAll(page = 1, limite = 10, patientId) {
        const [data, total] = await this.repo.findAndCount({
            where: patientId ? { patientId } : {},
            relations: ['chirurgien', 'anesthesiste', 'constantes'],
            skip: (page - 1) * limite,
            take: limite,
            order: { createdAt: 'DESC' },
        });
        const enriched = await this.accueilClient.enrichWithIdentity(data);
        return { data: enriched, total, page, pages: Math.ceil(total / limite) };
    }
    async findOne(id) {
        const a = await this.repo.findOne({
            where: { id },
            relations: ['chirurgien', 'anesthesiste', 'constantes'],
        });
        if (!a)
            throw new common_1.NotFoundException(`Activité ${id} non trouvée`);
        const [enriched] = await this.accueilClient.enrichWithIdentity([a]);
        return enriched;
    }
    async update(id, dto) {
        const a = await this.repo.findOne({ where: { id } });
        if (!a)
            throw new common_1.NotFoundException(`Activité ${id} non trouvée`);
        return this.repo.save(Object.assign(a, dto));
    }
    async remove(id) {
        const a = await this.repo.findOne({ where: { id } });
        if (!a)
            throw new common_1.NotFoundException(`Activité ${id} non trouvée`);
        await this.repo.delete(id);
        return { message: 'Activité supprimée' };
    }
    async ajouterConstante(activiteId, dto) {
        const activite = await this.repo.findOne({ where: { id: activiteId } });
        if (!activite)
            throw new common_1.NotFoundException(`Activité ${activiteId} non trouvée`);
        const horodatage = new Date(dto.horodatage);
        const constante = this.constanteRepo.create({
            fc: dto.fc,
            ta: dto.ta,
            spo2: dto.spo2,
            temperature: dto.temperature,
            capnie: dto.capnie,
            score: dto.score,
            horodatage,
            heure: horodatage.toTimeString().split(' ')[0].substring(0, 5),
            activitePerOp: activite,
        });
        const saved = await this.constanteRepo.save(constante);
        this.gateway.emitToOperation(activite.patientId, 'constante:ajoutee', { patientId: activite.patientId, constante: saved });
        return saved;
    }
};
exports.ActivitePerOpService = ActivitePerOpService;
exports.ActivitePerOpService = ActivitePerOpService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(activite_per_op_entity_1.ActivitePerOp)),
    __param(1, (0, typeorm_1.InjectRepository)(constante_per_op_entity_1.ConstantePerOp)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        accueil_client_1.AccueilClient,
        operation_gateway_1.OperationGateway])
], ActivitePerOpService);
//# sourceMappingURL=activite-per-op.service.js.map