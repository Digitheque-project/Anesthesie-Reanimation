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
exports.TracabiliteService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const historique_modification_entity_1 = require("../entities/historique-modification.entity");
let TracabiliteService = class TracabiliteService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async log(entite, entiteId, action, details, utilisateurId) {
        return this.repo.save(this.repo.create({
            entite,
            entiteId,
            action,
            details: JSON.stringify(details),
            utilisateurId,
        }));
    }
    async getHistorique(entite, entiteId) {
        return this.repo.find({
            where: { entite, entiteId },
            order: { createdAt: 'DESC' },
        });
    }
    async getTousHistoriques(page = 1, limite = 20) {
        const [data, total] = await this.repo.findAndCount({
            skip: (page - 1) * limite,
            take: limite,
            order: { createdAt: 'DESC' },
        });
        return { data, total, page, pages: Math.ceil(total / limite) };
    }
};
exports.TracabiliteService = TracabiliteService;
exports.TracabiliteService = TracabiliteService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(historique_modification_entity_1.HistoriqueModification)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TracabiliteService);
//# sourceMappingURL=tracabilite.service.js.map