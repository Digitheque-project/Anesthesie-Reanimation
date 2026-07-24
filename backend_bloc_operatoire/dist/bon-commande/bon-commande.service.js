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
exports.BonCommandeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bon_commande_anesthesie_entity_1 = require("../entities/bon-commande-anesthesie.entity");
const item_commande_entity_1 = require("../entities/item-commande.entity");
const accueil_client_1 = require("../external/accueil.client");
const medecin_identite_service_1 = require("../medecin/medecin-identite.service");
const INTERVENANTS = [
    ['chirurgienId', 'chirurgien'],
    ['anesthesisteId', 'anesthesiste'],
];
let BonCommandeService = class BonCommandeService {
    bonRepo;
    itemRepo;
    accueilClient;
    medecinIdentiteService;
    constructor(bonRepo, itemRepo, accueilClient, medecinIdentiteService) {
        this.bonRepo = bonRepo;
        this.itemRepo = itemRepo;
        this.accueilClient = accueilClient;
        this.medecinIdentiteService = medecinIdentiteService;
    }
    async create(dto) {
        const { items, ...data } = dto;
        const bon = this.bonRepo.create(data);
        const bonSaved = await this.bonRepo.save(bon);
        const saved = Array.isArray(bonSaved) ? bonSaved[0] : bonSaved;
        if (items?.length)
            await this.itemRepo.save(items.map((i) => this.itemRepo.create({ ...i, bonCommande: saved })));
        return this.findOne(saved.id);
    }
    async findAll(page = 1, limite = 10) {
        const [data, total] = await this.bonRepo.findAndCount({
            relations: ['verificationVeille', 'items'],
            skip: (page - 1) * limite,
            take: limite,
            order: { createdAt: 'DESC' },
        });
        const enrichedPatient = await this.accueilClient.enrichWithIdentity(data);
        const enriched = await this.medecinIdentiteService.enrichirPlusieurs(enrichedPatient, INTERVENANTS);
        return { data: enriched, total, page, pages: Math.ceil(total / limite) };
    }
    async findOne(id) {
        const bon = await this.bonRepo.findOne({
            where: { id },
            relations: ['verificationVeille', 'items'],
        });
        if (!bon)
            throw new common_1.NotFoundException(`Bon ${id} non trouvé`);
        const [enrichedPatient] = await this.accueilClient.enrichWithIdentity([
            bon,
        ]);
        const [enriched] = await this.medecinIdentiteService.enrichirPlusieurs([enrichedPatient], INTERVENANTS);
        return enriched;
    }
    async update(id, dto) {
        const bon = await this.bonRepo.findOne({ where: { id } });
        if (!bon)
            throw new common_1.NotFoundException(`Bon ${id} non trouvé`);
        return this.bonRepo.save(Object.assign(bon, dto));
    }
    async remove(id) {
        const bon = await this.bonRepo.findOne({ where: { id } });
        if (!bon)
            throw new common_1.NotFoundException(`Bon ${id} non trouvé`);
        await this.bonRepo.delete(id);
        return { message: 'Bon supprimé' };
    }
};
exports.BonCommandeService = BonCommandeService;
exports.BonCommandeService = BonCommandeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(bon_commande_anesthesie_entity_1.BonCommandeAnesthesie)),
    __param(1, (0, typeorm_1.InjectRepository)(item_commande_entity_1.ItemCommande)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        accueil_client_1.AccueilClient,
        medecin_identite_service_1.MedecinIdentiteService])
], BonCommandeService);
//# sourceMappingURL=bon-commande.service.js.map