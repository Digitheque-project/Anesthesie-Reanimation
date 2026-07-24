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
exports.MomentsCatalogueController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const moments_catalogue_service_1 = require("./moments-catalogue.service");
const create_moment_catalogue_entry_dto_1 = require("./dto/create-moment-catalogue-entry.dto");
const require_role_decorator_1 = require("../central-auth/require-role.decorator");
const role_clinique_1 = require("../central-auth/role-clinique");
let MomentsCatalogueController = class MomentsCatalogueController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll() {
        return this.service.findAll();
    }
    create(dto, req) {
        return this.service.create(dto, req.centralUser);
    }
};
exports.MomentsCatalogueController = MomentsCatalogueController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lister le catalogue des boutons de la chronologie opératoire' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MomentsCatalogueController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.ANESTHESISTE, role_clinique_1.RoleClinique.IBODE),
    (0, swagger_1.ApiOperation)({ summary: "Ajouter un bouton réutilisable au catalogue (à sa propre catégorie)" }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_moment_catalogue_entry_dto_1.CreateMomentCatalogueEntryDto, Object]),
    __metadata("design:returntype", void 0)
], MomentsCatalogueController.prototype, "create", null);
exports.MomentsCatalogueController = MomentsCatalogueController = __decorate([
    (0, swagger_1.ApiTags)('Catalogue des moments opératoires'),
    (0, common_1.Controller)('moments-catalogue'),
    __metadata("design:paramtypes", [moments_catalogue_service_1.MomentsCatalogueService])
], MomentsCatalogueController);
//# sourceMappingURL=moments-catalogue.controller.js.map