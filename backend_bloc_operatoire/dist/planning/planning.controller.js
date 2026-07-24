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
exports.PlanningController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const planning_service_1 = require("./planning.service");
const creneau_bloc_entity_1 = require("../entities/creneau-bloc.entity");
const require_role_decorator_1 = require("../central-auth/require-role.decorator");
const role_clinique_1 = require("../central-auth/role-clinique");
let PlanningController = class PlanningController {
    service;
    constructor(service) {
        this.service = service;
    }
    getJour(date, type) {
        return this.service.getPlanningJour(date, type);
    }
    getSemaine(debut, fin, type) {
        return this.service.getPlanningSemaine(debut, fin, type);
    }
    reserver(dto) {
        return this.service.reserverCreneau(dto);
    }
    annuler(id) {
        return this.service.annulerCreneau(id);
    }
    urgences() {
        return this.service.getUrgencesEnAttente();
    }
    transfererCpaVersVerificationVeille(dto) {
        return this.service.transfererCpaVersVerificationVeille(dto);
    }
    transfererVerificationVeilleVersPatientJour(dto) {
        return this.service.transfererVerificationVeilleVersPatientJour(dto);
    }
};
exports.PlanningController = PlanningController;
__decorate([
    (0, common_1.Get)('jour'),
    (0, swagger_1.ApiQuery)({ name: 'date', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, enum: creneau_bloc_entity_1.TypeRDV }),
    __param(0, (0, common_1.Query)('date')),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PlanningController.prototype, "getJour", null);
__decorate([
    (0, common_1.Get)('semaine'),
    __param(0, (0, common_1.Query)('debut')),
    __param(1, (0, common_1.Query)('fin')),
    __param(2, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], PlanningController.prototype, "getSemaine", null);
__decorate([
    (0, common_1.Post)('reserver'),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.MAJOR, role_clinique_1.RoleClinique.RESPONSABLE_CPA),
    (0, swagger_1.ApiOperation)({
        summary: 'Réserver un créneau (Major, ou Responsable CPA pour la planification CPA)',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PlanningController.prototype, "reserver", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.MAJOR, role_clinique_1.RoleClinique.RESPONSABLE_CPA),
    (0, swagger_1.ApiOperation)({
        summary: 'Annuler un créneau (Major, ou Responsable CPA pour la planification CPA)',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PlanningController.prototype, "annuler", null);
__decorate([
    (0, common_1.Get)('urgences'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PlanningController.prototype, "urgences", null);
__decorate([
    (0, common_1.Post)('transferer-cpa-vers-verification-veille'),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.RESPONSABLE_CPA),
    (0, swagger_1.ApiOperation)({
        summary: 'Transférer un patient de CPA vers Vérification veille (Responsable CPA)',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PlanningController.prototype, "transfererCpaVersVerificationVeille", null);
__decorate([
    (0, common_1.Post)('transferer-verification-veille-vers-patient-jour'),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.RESPONSABLE_CPA),
    (0, swagger_1.ApiOperation)({
        summary: 'Transférer un patient de Vérification veille vers Patient du jour (Responsable CPA)',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PlanningController.prototype, "transfererVerificationVeilleVersPatientJour", null);
exports.PlanningController = PlanningController = __decorate([
    (0, swagger_1.ApiTags)('Planning'),
    (0, common_1.Controller)('planning'),
    __metadata("design:paramtypes", [planning_service_1.PlanningService])
], PlanningController);
//# sourceMappingURL=planning.controller.js.map