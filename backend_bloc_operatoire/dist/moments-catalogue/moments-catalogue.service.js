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
var MomentsCatalogueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MomentsCatalogueService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const moment_catalogue_entry_entity_1 = require("../entities/moment-catalogue-entry.entity");
const moment_operatoire_entity_1 = require("../entities/moment-operatoire.entity");
const role_clinique_1 = require("../central-auth/role-clinique");
const CATALOGUE_INITIAL = {
    [moment_operatoire_entity_1.CategorieMoment.ANESTHESIE]: [
        'Pose voie veineuse',
        'Induction anesthésique',
        'Intubation',
        'Extubation',
        'Réveil anesthésique',
    ],
    [moment_operatoire_entity_1.CategorieMoment.CHIRURGIE]: [
        'Incision',
        'Ouverture',
        'Exploration',
        'Début du geste principal',
        'Fin du geste principal',
        'Hémostase',
        'Fermeture pariétale',
        'Fermeture cutanée',
        'Pansement',
    ],
    [moment_operatoire_entity_1.CategorieMoment.DIVERS]: [
        'Antibioprophylaxie administrée',
        'Début transfusion',
        'Fin transfusion',
        'Incident / complication',
        'Sortie de salle',
    ],
};
const CATEGORIES_AUTORISEES = {
    [role_clinique_1.RoleClinique.ANESTHESISTE]: [moment_operatoire_entity_1.CategorieMoment.ANESTHESIE],
    [role_clinique_1.RoleClinique.IBODE]: [moment_operatoire_entity_1.CategorieMoment.CHIRURGIE, moment_operatoire_entity_1.CategorieMoment.DIVERS],
};
let MomentsCatalogueService = MomentsCatalogueService_1 = class MomentsCatalogueService {
    repo;
    logger = new common_1.Logger(MomentsCatalogueService_1.name);
    constructor(repo) {
        this.repo = repo;
    }
    async onModuleInit() {
        const total = await this.repo.count();
        if (total > 0)
            return;
        const seed = Object.keys(CATALOGUE_INITIAL).flatMap((categorie) => CATALOGUE_INITIAL[categorie].map((label) => this.repo.create({ categorie, label })));
        await this.repo.save(seed);
        this.logger.log(`Catalogue de moments opératoires initialisé (${seed.length} entrées).`);
    }
    async findAll() {
        return this.repo.find({ order: { createdAt: 'DESC' } });
    }
    async create(dto, centralUser) {
        const role = (0, role_clinique_1.matchRoleClinique)(centralUser.role);
        const autorisees = role ? CATEGORIES_AUTORISEES[role] : undefined;
        if (!autorisees || !autorisees.includes(dto.categorie)) {
            throw new common_1.ForbiddenException(`Votre rôle (${centralUser.role}) ne peut pas ajouter de bouton à la catégorie ${dto.categorie}.`);
        }
        const entry = this.repo.create({
            categorie: dto.categorie,
            label: dto.label.trim(),
            creeParNom: `${centralUser.prenom} ${centralUser.nom}`.trim(),
        });
        return this.repo.save(entry);
    }
};
exports.MomentsCatalogueService = MomentsCatalogueService;
exports.MomentsCatalogueService = MomentsCatalogueService = MomentsCatalogueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(moment_catalogue_entry_entity_1.MomentCatalogueEntry)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MomentsCatalogueService);
//# sourceMappingURL=moments-catalogue.service.js.map