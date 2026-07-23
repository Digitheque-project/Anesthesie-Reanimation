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
exports.CPAController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cpa_service_1 = require("./cpa.service");
const create_cpa_dto_1 = require("./dto/create-cpa.dto");
const update_cpa_dto_1 = require("./dto/update-cpa.dto");
const require_role_decorator_1 = require("../central-auth/require-role.decorator");
const role_clinique_1 = require("../central-auth/role-clinique");
let CPAController = class CPAController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(d, req) { return this.service.create(d, req.centralUser); }
    findAll(p, l, patientId) { return this.service.findAll(p, l, patientId); }
    findOne(id) { return this.service.findOne(id); }
    update(id, d) { return this.service.update(id, d); }
    remove(id) { return this.service.remove(id); }
};
exports.CPAController = CPAController;
__decorate([
    (0, common_1.Post)(),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.ANESTHESISTE, role_clinique_1.RoleClinique.RESPONSABLE_CPA, role_clinique_1.RoleClinique.MAJOR),
    (0, swagger_1.ApiOperation)({ summary: "Créer une CPA — décision Apte/Inapte/Report (Anesthésiste, Responsable CPA ou Major ; l'anesthésiste ayant réalisé la consultation est auto-attribué depuis la session si elle est ANESTHESISTE, sinon doit être sélectionné explicitement)" }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_cpa_dto_1.CreateCPADto, Object]),
    __metadata("design:returntype", void 0)
], CPAController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les CPA' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limite')),
    __param(2, (0, common_1.Query)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", void 0)
], CPAController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir une CPA' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CPAController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.ANESTHESISTE, role_clinique_1.RoleClinique.RESPONSABLE_CPA, role_clinique_1.RoleClinique.MAJOR),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier une CPA (Anesthésiste, Responsable CPA ou Major)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_cpa_dto_1.UpdateCPADto]),
    __metadata("design:returntype", void 0)
], CPAController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.ANESTHESISTE),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer une CPA (Anesthésiste)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CPAController.prototype, "remove", null);
exports.CPAController = CPAController = __decorate([
    (0, swagger_1.ApiTags)('CPA'),
    (0, common_1.Controller)('cpa'),
    __metadata("design:paramtypes", [cpa_service_1.CPAService])
], CPAController);
//# sourceMappingURL=cpa.controller.js.map