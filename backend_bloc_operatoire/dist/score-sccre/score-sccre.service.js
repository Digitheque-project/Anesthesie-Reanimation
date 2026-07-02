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
exports.ScoreSCCREService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const score_sccre_entity_1 = require("../entities/score-sccre.entity");
const accueil_client_1 = require("../external/accueil.client");
let ScoreSCCREService = class ScoreSCCREService {
    repo;
    accueilClient;
    constructor(repo, accueilClient) {
        this.repo = repo;
        this.accueilClient = accueilClient;
    }
    async create(dto) { const saved = await this.repo.save(this.repo.create(dto)); return Array.isArray(saved) ? saved[0] : saved; }
    async findAll(page = 1, limite = 10) {
        const [data, total] = await this.repo.findAndCount({ relations: ['anesthesiste'], skip: (page - 1) * limite, take: limite, order: { createdAt: 'DESC' } });
        const enriched = await this.accueilClient.enrichWithIdentity(data);
        return { data: enriched, total, page, pages: Math.ceil(total / limite) };
    }
    async findOne(id) {
        const s = await this.repo.findOne({ where: { id }, relations: ['anesthesiste'] });
        if (!s)
            throw new common_1.NotFoundException(`Score ${id} non trouvé`);
        const [enriched] = await this.accueilClient.enrichWithIdentity([s]);
        return enriched;
    }
    async update(id, dto) {
        const s = await this.repo.findOne({ where: { id } });
        if (!s)
            throw new common_1.NotFoundException(`Score ${id} non trouvé`);
        return this.repo.save(Object.assign(s, dto));
    }
    async remove(id) {
        const s = await this.repo.findOne({ where: { id } });
        if (!s)
            throw new common_1.NotFoundException(`Score ${id} non trouvé`);
        await this.repo.delete(id);
        return { message: 'Score supprimé' };
    }
};
exports.ScoreSCCREService = ScoreSCCREService;
exports.ScoreSCCREService = ScoreSCCREService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(score_sccre_entity_1.ScoreSCCRE)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        accueil_client_1.AccueilClient])
], ScoreSCCREService);
//# sourceMappingURL=score-sccre.service.js.map