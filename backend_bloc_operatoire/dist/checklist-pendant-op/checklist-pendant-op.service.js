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
exports.ChecklistPendantOpService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const checklist_pendant_op_entity_1 = require("../entities/checklist-pendant-op.entity");
const accueil_client_1 = require("../external/accueil.client");
const operation_gateway_1 = require("../operation-gateway/operation.gateway");
const patient_bloc_statut_service_1 = require("../patient-bloc/patient-bloc-statut.service");
let ChecklistPendantOpService = class ChecklistPendantOpService {
    repo;
    accueilClient;
    gateway;
    patientBlocStatutService;
    constructor(repo, accueilClient, gateway, patientBlocStatutService) {
        this.repo = repo;
        this.accueilClient = accueilClient;
        this.gateway = gateway;
        this.patientBlocStatutService = patientBlocStatutService;
    }
    async create(dto, centralUser) {
        const saved = await this.repo.save(this.repo.create({
            ...dto,
            validateurId: centralUser.userId,
            validateurNom: `${centralUser.prenom} ${centralUser.nom}`.trim(),
            validateurRole: centralUser.role,
        }));
        await this.patientBlocStatutService.avancerVersEnCoursOperation(saved.patientId);
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
            throw new common_1.NotFoundException(`Checklist pendant opération ${id} non trouvée`);
        const [enriched] = await this.accueilClient.enrichWithIdentity([checklist]);
        return enriched;
    }
    async update(id, dto) {
        const checklist = await this.repo.findOne({ where: { id } });
        if (!checklist)
            throw new common_1.NotFoundException(`Checklist pendant opération ${id} non trouvée`);
        const updated = await this.repo.save(Object.assign(checklist, dto));
        this.gateway.emitToOperation(updated.patientId, 'checklist-pendant-op:maj', { patientId: updated.patientId, checklist: updated });
        return updated;
    }
};
exports.ChecklistPendantOpService = ChecklistPendantOpService;
exports.ChecklistPendantOpService = ChecklistPendantOpService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(checklist_pendant_op_entity_1.ChecklistPendantOp)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        accueil_client_1.AccueilClient,
        operation_gateway_1.OperationGateway,
        patient_bloc_statut_service_1.PatientBlocStatutService])
], ChecklistPendantOpService);
//# sourceMappingURL=checklist-pendant-op.service.js.map