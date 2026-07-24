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
exports.MomentsOperatoireService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const moment_operatoire_entity_1 = require("../entities/moment-operatoire.entity");
const operation_gateway_1 = require("../operation-gateway/operation.gateway");
const role_clinique_1 = require("../central-auth/role-clinique");
let MomentsOperatoireService = class MomentsOperatoireService {
    repo;
    gateway;
    constructor(repo, gateway) {
        this.repo = repo;
        this.gateway = gateway;
    }
    async create(dto, centralUser) {
        const role = (0, role_clinique_1.matchRoleClinique)(centralUser.role);
        const categoriesAutorisees = {
            [role_clinique_1.RoleClinique.ANESTHESISTE]: ['ANESTHESIE'],
            [role_clinique_1.RoleClinique.IBODE]: ['CHIRURGIE', 'DIVERS'],
        };
        const autorisees = role ? categoriesAutorisees[role] : undefined;
        if (!autorisees || !autorisees.includes(dto.categorie)) {
            throw new common_1.ForbiddenException(`Votre rôle (${centralUser.role}) ne peut pas horodater la catégorie ${dto.categorie}.`);
        }
        const moment = this.repo.create({
            ...dto,
            horodatage: new Date(dto.horodatage),
            auteurId: centralUser.userId,
            auteurNom: `${centralUser.prenom} ${centralUser.nom}`.trim(),
            auteurRole: centralUser.role,
        });
        const saved = await this.repo.save(moment);
        this.gateway.emitToOperation(saved.patientId, 'moment:cree', {
            patientId: saved.patientId,
            moment: saved,
        });
        return saved;
    }
    async findAll(patientId, inclureAnnules = false) {
        return this.repo.find({
            where: inclureAnnules ? { patientId } : { patientId, annule: false },
            order: { horodatage: 'ASC' },
        });
    }
    async annuler(id, centralUser) {
        const moment = await this.repo.findOne({ where: { id } });
        if (!moment)
            throw new common_1.NotFoundException(`Moment opératoire ${id} non trouvé`);
        moment.annule = true;
        moment.annuleLe = new Date();
        moment.annuleParNom = `${centralUser.prenom} ${centralUser.nom}`.trim();
        const saved = await this.repo.save(moment);
        this.gateway.emitToOperation(saved.patientId, 'moment:annule', {
            patientId: saved.patientId,
            momentId: saved.id,
            annuleParNom: saved.annuleParNom,
        });
        return saved;
    }
};
exports.MomentsOperatoireService = MomentsOperatoireService;
exports.MomentsOperatoireService = MomentsOperatoireService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(moment_operatoire_entity_1.MomentOperatoire)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        operation_gateway_1.OperationGateway])
], MomentsOperatoireService);
//# sourceMappingURL=moments-operatoire.service.js.map