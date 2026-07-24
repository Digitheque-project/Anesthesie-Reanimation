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
exports.MomentsOperatoireController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const moments_operatoire_service_1 = require("./moments-operatoire.service");
const create_moment_operatoire_dto_1 = require("./dto/create-moment-operatoire.dto");
const require_role_decorator_1 = require("../central-auth/require-role.decorator");
const role_clinique_1 = require("../central-auth/role-clinique");
let MomentsOperatoireController = class MomentsOperatoireController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(dto, req) {
        return this.service.create(dto, req.centralUser);
    }
    findAll(patientId, inclureAnnules) {
        return this.service.findAll(patientId, inclureAnnules === 'true');
    }
    annuler(id, req) {
        return this.service.annuler(id, req.centralUser);
    }
};
exports.MomentsOperatoireController = MomentsOperatoireController;
__decorate([
    (0, common_1.Post)(),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.ANESTHESISTE, role_clinique_1.RoleClinique.IBODE),
    (0, swagger_1.ApiOperation)({
        summary: 'Horodater un moment opératoire (Anesthésiste ou IBODE)',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_moment_operatoire_dto_1.CreateMomentOperatoireDto, Object]),
    __metadata("design:returntype", void 0)
], MomentsOperatoireController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiQuery)({ name: 'patientId', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'inclureAnnules', required: false, type: Boolean }),
    (0, swagger_1.ApiOperation)({
        summary: 'Lister la chronologie des moments opératoires du patient',
    }),
    __param(0, (0, common_1.Query)('patientId')),
    __param(1, (0, common_1.Query)('inclureAnnules')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MomentsOperatoireController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id/annuler'),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.ANESTHESISTE, role_clinique_1.RoleClinique.IBODE),
    (0, swagger_1.ApiOperation)({
        summary: 'Annuler (suppression douce) un moment opératoire horodaté par erreur',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MomentsOperatoireController.prototype, "annuler", null);
exports.MomentsOperatoireController = MomentsOperatoireController = __decorate([
    (0, swagger_1.ApiTags)('Moments Opératoires'),
    (0, common_1.Controller)('moments-operatoires'),
    __metadata("design:paramtypes", [moments_operatoire_service_1.MomentsOperatoireService])
], MomentsOperatoireController);
//# sourceMappingURL=moments-operatoire.controller.js.map