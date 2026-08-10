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
exports.ChecklistAvantOpController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const checklist_avant_op_entity_1 = require("../entities/checklist-avant-op.entity");
const accueil_client_1 = require("../external/accueil.client");
const require_role_decorator_1 = require("../central-auth/require-role.decorator");
const role_clinique_1 = require("../central-auth/role-clinique");
const tracabilite_service_1 = require("../tracabilite/tracabilite.service");
const create_checklist_avant_op_dto_1 = require("./dto/create-checklist-avant-op.dto");
const update_checklist_avant_op_dto_1 = require("./dto/update-checklist-avant-op.dto");
const ITEMS_TRI_STATE = [
    'identiteConfirmee',
    'interventionSiteConfirmes',
    'documentationDisponible',
    'installationConnue',
    'allergiePatient',
    'risqueIntubation',
    'risqueSaignement',
];
const ITEMS_COCHES = ['materielChirurgicalVerifie', 'materielAnesthesiqueVerifie'];
function verifierChecklistComplete(dto) {
    const manquants = ITEMS_TRI_STATE.filter((cle) => dto[cle] === null || dto[cle] === undefined);
    const nonCoches = ITEMS_COCHES.filter((cle) => dto[cle] !== true);
    if (manquants.length || nonCoches.length) {
        throw new common_1.BadRequestException(`Checklist incomplète — items manquants : ${[...manquants, ...nonCoches].join(', ')}`);
    }
}
let ChecklistAvantOpController = class ChecklistAvantOpController {
    repo;
    accueilClient;
    tracabiliteService;
    constructor(repo, accueilClient, tracabiliteService) {
        this.repo = repo;
        this.accueilClient = accueilClient;
        this.tracabiliteService = tracabiliteService;
    }
    async create(dto, req) {
        verifierChecklistComplete(dto);
        const centralUser = req.centralUser;
        const savedResult = await this.repo.save(this.repo.create({
            ...dto,
            validateurId: centralUser?.userId,
            validateurNom: centralUser
                ? `${centralUser.prenom} ${centralUser.nom}`.trim()
                : undefined,
            validateurRole: centralUser?.role,
        }));
        const saved = Array.isArray(savedResult)
            ? savedResult[0]
            : savedResult;
        await this.tracabiliteService.log('ChecklistAvantOp', saved.id, 'CREATE', { patientId: saved.patientId }, centralUser?.userId);
        return saved;
    }
    async findAll(patientId) {
        const data = await this.repo.find({
            where: patientId ? { patientId } : {},
        });
        return this.accueilClient.enrichWithIdentity(data);
    }
    async findOne(id) {
        const checklist = await this.repo.findOne({ where: { id } });
        if (!checklist)
            return null;
        const [enriched] = await this.accueilClient.enrichWithIdentity([checklist]);
        return enriched;
    }
    async update(id, dto, req) {
        const result = await this.repo.update(id, dto);
        await this.tracabiliteService.log('ChecklistAvantOp', id, 'UPDATE', dto, req.centralUser?.userId);
        return result;
    }
};
exports.ChecklistAvantOpController = ChecklistAvantOpController;
__decorate([
    (0, common_1.Post)(),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.ANESTHESISTE),
    (0, swagger_1.ApiOperation)({
        summary: 'Créer une checklist avant opération (Anesthésiste)',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_checklist_avant_op_dto_1.CreateChecklistAvantOpDto, Object]),
    __metadata("design:returntype", Promise)
], ChecklistAvantOpController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les checklists avant opération' }),
    __param(0, (0, common_1.Query)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChecklistAvantOpController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChecklistAvantOpController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.ANESTHESISTE),
    (0, swagger_1.ApiOperation)({
        summary: 'Modifier une checklist avant opération (Anesthésiste)',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_checklist_avant_op_dto_1.UpdateChecklistAvantOpDto, Object]),
    __metadata("design:returntype", Promise)
], ChecklistAvantOpController.prototype, "update", null);
exports.ChecklistAvantOpController = ChecklistAvantOpController = __decorate([
    (0, swagger_1.ApiTags)('Checklist Avant Op'),
    (0, common_1.Controller)('checklists-avant-op'),
    __param(0, (0, typeorm_1.InjectRepository)(checklist_avant_op_entity_1.ChecklistAvantOp)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        accueil_client_1.AccueilClient,
        tracabilite_service_1.TracabiliteService])
], ChecklistAvantOpController);
//# sourceMappingURL=checklist-avant-op.controller.js.map