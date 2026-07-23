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
exports.DemandeCpaExterneController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const demande_cpa_externe_service_1 = require("./demande-cpa-externe.service");
const receive_demande_cpa_dto_1 = require("./dto/receive-demande-cpa.dto");
const update_demande_cpa_dto_1 = require("./dto/update-demande-cpa.dto");
const planifier_demande_cpa_dto_1 = require("./dto/planifier-demande-cpa.dto");
const demande_cpa_externe_entity_1 = require("../entities/demande-cpa-externe.entity");
const public_decorator_1 = require("../central-auth/public.decorator");
const require_role_decorator_1 = require("../central-auth/require-role.decorator");
const role_clinique_1 = require("../central-auth/role-clinique");
let DemandeCpaExterneController = class DemandeCpaExterneController {
    service;
    constructor(service) {
        this.service = service;
    }
    async receive(dto) {
        const demande = await this.service.receive(dto);
        return { received: true, id: demande.id, statut: demande.statut, timestamp: new Date().toISOString() };
    }
    getStatutPublic(id) {
        return this.service.findStatutPublic(id);
    }
    findAll(statut) {
        return this.service.findAll(statut);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    update(id, dto) {
        return this.service.update(id, dto);
    }
    planifier(id, dto) {
        return this.service.planifier(id, dto);
    }
};
exports.DemandeCpaExterneController = DemandeCpaExterneController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('receive'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: "Recevoir une demande de CPA/VPA d'un service externe",
        description: "Point d'entrée pour tout service externe du CHU souhaitant qu'un de ses patients passe une " +
            "Consultation Pré-Anesthésique avant un acte sous anesthésie. Fournir `sourceCallbackUrl` pour " +
            "recevoir automatiquement le résultat (décision APTE/INAPTE/REPORT) dès que la CPA est réalisée.",
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Demande enregistrée avec succès.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [receive_demande_cpa_dto_1.ReceiveDemandeCpaDto]),
    __metadata("design:returntype", Promise)
], DemandeCpaExterneController.prototype, "receive", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id/statut'),
    (0, swagger_1.ApiOperation)({ summary: "Consulter l'état d'une demande de CPA externe (accessible au service demandeur, sans authentification)" }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DemandeCpaExterneController.prototype, "getStatutPublic", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les demandes de CPA externes' }),
    (0, swagger_1.ApiQuery)({ name: 'statut', required: false, enum: demande_cpa_externe_entity_1.StatutDemandeCpaExterne }),
    __param(0, (0, common_1.Query)('statut')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DemandeCpaExterneController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir une demande de CPA externe' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DemandeCpaExterneController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.RESPONSABLE_CPA, role_clinique_1.RoleClinique.MAJOR),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier une demande de CPA externe (Responsable CPA, Major)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_demande_cpa_dto_1.UpdateDemandeCpaDto]),
    __metadata("design:returntype", void 0)
], DemandeCpaExterneController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/planifier'),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.RESPONSABLE_CPA, role_clinique_1.RoleClinique.MAJOR),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Planifier le rendez-vous CPA/VPA pour cette demande externe (Responsable CPA, Major)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, planifier_demande_cpa_dto_1.PlanifierDemandeCpaDto]),
    __metadata("design:returntype", void 0)
], DemandeCpaExterneController.prototype, "planifier", null);
exports.DemandeCpaExterneController = DemandeCpaExterneController = __decorate([
    (0, swagger_1.ApiTags)('Demandes CPA externes'),
    (0, common_1.Controller)('demandes-cpa-externes'),
    __metadata("design:paramtypes", [demande_cpa_externe_service_1.DemandeCpaExterneService])
], DemandeCpaExterneController);
//# sourceMappingURL=demande-cpa-externe.controller.js.map