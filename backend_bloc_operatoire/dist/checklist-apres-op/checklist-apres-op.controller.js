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
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const checklist_apres_op_entity_1 = require("../entities/checklist-apres-op.entity");
const accueil_client_1 = require("../external/accueil.client");
let ChecklistApresOpController = class ChecklistApresOpController {
    repo;
    accueilClient;
    constructor(repo, accueilClient) {
        this.repo = repo;
        this.accueilClient = accueilClient;
    }
    create(dto) { return this.repo.save(this.repo.create(dto)); }
    async findAll(patientId) {
        const data = await this.repo.find({ where: patientId ? { patientId } : {} });
        return this.accueilClient.enrichWithIdentity(data);
    }
    async findOne(id) {
        const checklist = await this.repo.findOne({ where: { id } });
        if (!checklist)
            return null;
        const [enriched] = await this.accueilClient.enrichWithIdentity([checklist]);
        return enriched;
    }
    update(id, dto) { return this.repo.update(id, dto); }
};
exports.ChecklistApresOpController = ChecklistApresOpController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une checklist après opération' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChecklistApresOpController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les checklists après opération' }),
    __param(0, (0, common_1.Query)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChecklistApresOpController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChecklistApresOpController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ChecklistApresOpController.prototype, "update", null);
exports.ChecklistApresOpController = ChecklistApresOpController = __decorate([
    (0, swagger_1.ApiTags)('Checklist Après Op'),
    (0, common_1.Controller)('checklists-apres-op'),
    __param(0, (0, typeorm_1.InjectRepository)(checklist_apres_op_entity_1.ChecklistApresOp)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        accueil_client_1.AccueilClient])
], ChecklistApresOpController);
//# sourceMappingURL=checklist-apres-op.controller.js.map