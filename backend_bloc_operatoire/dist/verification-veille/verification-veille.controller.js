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
exports.VerificationVeilleController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const verification_veille_service_1 = require("./verification-veille.service");
const create_verification_veille_dto_1 = require("./dto/create-verification-veille.dto");
const update_verification_veille_dto_1 = require("./dto/update-verification-veille.dto");
const require_role_decorator_1 = require("../central-auth/require-role.decorator");
const role_clinique_1 = require("../central-auth/role-clinique");
let VerificationVeilleController = class VerificationVeilleController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(d) { return this.service.create(d); }
    findAll(p, l) { return this.service.findAll(p, l); }
    findOne(id) { return this.service.findOne(id); }
    update(id, d) { return this.service.update(id, d); }
    remove(id) { return this.service.remove(id); }
};
exports.VerificationVeilleController = VerificationVeilleController;
__decorate([
    (0, common_1.Post)(),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.ANESTHESISTE),
    (0, swagger_1.ApiOperation)({ summary: "Créer une vérification à la veille de l'intervention (Anesthésiste)" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_verification_veille_dto_1.CreateVerificationVeilleDto]),
    __metadata("design:returntype", void 0)
], VerificationVeilleController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les vérifications veille' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limite')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], VerificationVeilleController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir une vérification veille' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VerificationVeilleController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.ANESTHESISTE),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier une vérification veille (Anesthésiste)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_verification_veille_dto_1.UpdateVerificationVeilleDto]),
    __metadata("design:returntype", void 0)
], VerificationVeilleController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.ANESTHESISTE),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer une vérification veille (Anesthésiste)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VerificationVeilleController.prototype, "remove", null);
exports.VerificationVeilleController = VerificationVeilleController = __decorate([
    (0, swagger_1.ApiTags)('Vérification veille'),
    (0, common_1.Controller)('verification-veille'),
    __metadata("design:paramtypes", [verification_veille_service_1.VerificationVeilleService])
], VerificationVeilleController);
//# sourceMappingURL=verification-veille.controller.js.map