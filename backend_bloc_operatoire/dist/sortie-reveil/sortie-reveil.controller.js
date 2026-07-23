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
exports.SortieReveilController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const sortie_reveil_service_1 = require("./sortie-reveil.service");
const create_sortie_reveil_dto_1 = require("./dto/create-sortie-reveil.dto");
const update_sortie_reveil_dto_1 = require("./dto/update-sortie-reveil.dto");
const require_role_decorator_1 = require("../central-auth/require-role.decorator");
const role_clinique_1 = require("../central-auth/role-clinique");
let SortieReveilController = class SortieReveilController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(dto, req) { return this.service.create(dto, req.centralUser); }
    findAll(p, l) { return this.service.findAll(p, l); }
    findOne(id) { return this.service.findOne(id); }
    update(id, dto) { return this.service.update(id, dto); }
    remove(id) { return this.service.remove(id); }
};
exports.SortieReveilController = SortieReveilController;
__decorate([
    (0, common_1.Post)(),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.ANESTHESISTE),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une sortie de réveil (Anesthésiste — auto-attribué depuis la session)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sortie_reveil_dto_1.CreateSortieReveilDto, Object]),
    __metadata("design:returntype", void 0)
], SortieReveilController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lister toutes les sorties' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limite', required: false }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limite')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], SortieReveilController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir une sortie par ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SortieReveilController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.ANESTHESISTE),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier une sortie (Anesthésiste)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_sortie_reveil_dto_1.UpdateSortieReveilDto]),
    __metadata("design:returntype", void 0)
], SortieReveilController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.ANESTHESISTE),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer une sortie (Anesthésiste)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SortieReveilController.prototype, "remove", null);
exports.SortieReveilController = SortieReveilController = __decorate([
    (0, swagger_1.ApiTags)('Sorties Réveil'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('sorties-reveil'),
    __metadata("design:paramtypes", [sortie_reveil_service_1.SortieReveilService])
], SortieReveilController);
//# sourceMappingURL=sortie-reveil.controller.js.map