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
exports.ChecklistApresOpController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const checklist_apres_op_service_1 = require("./checklist-apres-op.service");
const create_checklist_apres_op_dto_1 = require("./dto/create-checklist-apres-op.dto");
const update_checklist_apres_op_dto_1 = require("./dto/update-checklist-apres-op.dto");
const require_role_decorator_1 = require("../central-auth/require-role.decorator");
const role_clinique_1 = require("../central-auth/role-clinique");
let ChecklistApresOpController = class ChecklistApresOpController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(dto, req) {
        return this.service.create(dto, req.centralUser);
    }
    findAll(patientId) {
        return this.service.findAll(patientId);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    update(id, dto) {
        return this.service.update(id, dto);
    }
};
exports.ChecklistApresOpController = ChecklistApresOpController;
__decorate([
    (0, common_1.Post)(),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.ANESTHESISTE),
    (0, swagger_1.ApiOperation)({
        summary: 'Créer une checklist après opération (Anesthésiste)',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_checklist_apres_op_dto_1.CreateChecklistApresOpDto, Object]),
    __metadata("design:returntype", void 0)
], ChecklistApresOpController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les checklists après opération' }),
    __param(0, (0, common_1.Query)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ChecklistApresOpController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir une checklist après opération' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ChecklistApresOpController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.ANESTHESISTE),
    (0, swagger_1.ApiOperation)({
        summary: 'Modifier une checklist après opération (Anesthésiste)',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_checklist_apres_op_dto_1.UpdateChecklistApresOpDto]),
    __metadata("design:returntype", void 0)
], ChecklistApresOpController.prototype, "update", null);
exports.ChecklistApresOpController = ChecklistApresOpController = __decorate([
    (0, swagger_1.ApiTags)('Checklist Après Op'),
    (0, common_1.Controller)('checklists-apres-op'),
    __metadata("design:paramtypes", [checklist_apres_op_service_1.ChecklistApresOpService])
], ChecklistApresOpController);
//# sourceMappingURL=checklist-apres-op.controller.js.map