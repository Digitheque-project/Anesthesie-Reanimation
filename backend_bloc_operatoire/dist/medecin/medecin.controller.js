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
exports.MedecinController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const medecin_service_1 = require("./medecin.service");
const create_medecin_dto_1 = require("./dto/create-medecin.dto");
const update_medecin_dto_1 = require("./dto/update-medecin.dto");
let MedecinController = class MedecinController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(d) {
        return this.service.create(d);
    }
    findAll(r, s) {
        return this.service.findAll({ role: r, recherche: s });
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    update(id, d) {
        return this.service.update(id, d);
    }
    remove(id) {
        return this.service.remove(id);
    }
};
exports.MedecinController = MedecinController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un médecin' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_medecin_dto_1.CreateMedecinDto]),
    __metadata("design:returntype", void 0)
], MedecinController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les médecins' }),
    __param(0, (0, common_1.Query)('role')),
    __param(1, (0, common_1.Query)('recherche')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MedecinController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir un médecin' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MedecinController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier un médecin' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_medecin_dto_1.UpdateMedecinDto]),
    __metadata("design:returntype", void 0)
], MedecinController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un médecin' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MedecinController.prototype, "remove", null);
exports.MedecinController = MedecinController = __decorate([
    (0, swagger_1.ApiTags)('Medecins'),
    (0, common_1.Controller)('medecins'),
    __metadata("design:paramtypes", [medecin_service_1.MedecinService])
], MedecinController);
//# sourceMappingURL=medecin.controller.js.map