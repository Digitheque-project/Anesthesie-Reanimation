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
const demande_cpa_externe_entity_1 = require("../entities/demande-cpa-externe.entity");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let DemandeCpaExterneController = class DemandeCpaExterneController {
    service;
    constructor(service) {
        this.service = service;
    }
    async receive(dto) {
        const demande = await this.service.receive(dto);
        return { received: true, id: demande.id, statut: demande.statut, timestamp: new Date().toISOString() };
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
};
exports.DemandeCpaExterneController = DemandeCpaExterneController;
__decorate([
    (0, common_1.Post)('receive'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: '📋 Recevoir une demande de CPA/VPA d\'un service externe (ex: Endoscopie)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Demande reçue avec succès' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [receive_demande_cpa_dto_1.ReceiveDemandeCpaDto]),
    __metadata("design:returntype", Promise)
], DemandeCpaExterneController.prototype, "receive", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
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
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir une demande de CPA externe' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DemandeCpaExterneController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Planifier / mettre à jour une demande de CPA externe' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_demande_cpa_dto_1.UpdateDemandeCpaDto]),
    __metadata("design:returntype", void 0)
], DemandeCpaExterneController.prototype, "update", null);
exports.DemandeCpaExterneController = DemandeCpaExterneController = __decorate([
    (0, swagger_1.ApiTags)('Demandes CPA externes'),
    (0, common_1.Controller)('demandes-cpa-externes'),
    __metadata("design:paramtypes", [demande_cpa_externe_service_1.DemandeCpaExterneService])
], DemandeCpaExterneController);
//# sourceMappingURL=demande-cpa-externe.controller.js.map