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
exports.ProtocoleOperatoireController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const protocole_operatoire_service_1 = require("./protocole-operatoire.service");
const create_protocole_operatoire_dto_1 = require("./dto/create-protocole-operatoire.dto");
const update_protocole_operatoire_dto_1 = require("./dto/update-protocole-operatoire.dto");
const require_role_decorator_1 = require("../central-auth/require-role.decorator");
const role_clinique_1 = require("../central-auth/role-clinique");
let ProtocoleOperatoireController = class ProtocoleOperatoireController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(dto) { return this.service.create(dto); }
    findAll(p, l, patientId) { return this.service.findAll(p, l, patientId); }
    findOne(id) { return this.service.findOne(id); }
    update(id, dto) { return this.service.update(id, dto); }
    remove(id) { return this.service.remove(id); }
};
exports.ProtocoleOperatoireController = ProtocoleOperatoireController;
__decorate([
    (0, common_1.Post)(),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.CHIRURGIEN),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un protocole opératoire (Chirurgien)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_protocole_operatoire_dto_1.CreateProtocoleOperatoireDto]),
    __metadata("design:returntype", void 0)
], ProtocoleOperatoireController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lister tous les protocoles' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limite', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'patientId', required: false }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limite')),
    __param(2, (0, common_1.Query)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", void 0)
], ProtocoleOperatoireController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir un protocole par ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProtocoleOperatoireController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.CHIRURGIEN),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier un protocole (Chirurgien)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_protocole_operatoire_dto_1.UpdateProtocoleOperatoireDto]),
    __metadata("design:returntype", void 0)
], ProtocoleOperatoireController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.CHIRURGIEN),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un protocole (Chirurgien)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProtocoleOperatoireController.prototype, "remove", null);
exports.ProtocoleOperatoireController = ProtocoleOperatoireController = __decorate([
    (0, swagger_1.ApiTags)('Protocoles'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('protocoles-operatoires'),
    __metadata("design:paramtypes", [protocole_operatoire_service_1.ProtocoleOperatoireService])
], ProtocoleOperatoireController);
//# sourceMappingURL=protocole-operatoire.controller.js.map