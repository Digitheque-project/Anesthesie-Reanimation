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
exports.PatientBlocController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const patient_bloc_service_1 = require("./patient-bloc.service");
const admit_existing_patient_dto_1 = require("./dto/admit-existing-patient.dto");
const register_and_admit_patient_dto_1 = require("./dto/register-and-admit-patient.dto");
const update_patient_bloc_dto_1 = require("./dto/update-patient-bloc.dto");
let PatientBlocController = class PatientBlocController {
    patientBlocService;
    constructor(patientBlocService) {
        this.patientBlocService = patientBlocService;
    }
    search(q) {
        return this.patientBlocService.search(q);
    }
    getExternal(externalId) {
        return this.patientBlocService.getExternal(externalId);
    }
    admitExisting(dto) {
        return this.patientBlocService.admitExisting(dto);
    }
    registerAndAdmit(dto, req) {
        const createdBy = req.user?.id ?? req.user?.email ?? 'unknown';
        return this.patientBlocService.registerAndAdmit(dto, createdBy);
    }
    findAll(statut, niveauUrgence, recherche, page, limite) {
        return this.patientBlocService.findAll({ statut, niveauUrgence, recherche, page, limite });
    }
    findOne(patientId) {
        return this.patientBlocService.findOne(patientId);
    }
    update(patientId, dto) {
        return this.patientBlocService.update(patientId, dto);
    }
    remove(patientId) {
        return this.patientBlocService.remove(patientId);
    }
};
exports.PatientBlocController = PatientBlocController;
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Rechercher un patient dans le service Accueil' }),
    (0, swagger_1.ApiQuery)({ name: 'q', required: false }),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PatientBlocController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('external/:externalId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir un patient depuis le service Accueil (avant admission)' }),
    __param(0, (0, common_1.Param)('externalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PatientBlocController.prototype, "getExternal", null);
__decorate([
    (0, common_1.Post)('admit'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Admettre au bloc un patient déjà enregistré dans Accueil' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admit_existing_patient_dto_1.AdmitExistingPatientDto]),
    __metadata("design:returntype", void 0)
], PatientBlocController.prototype, "admitExisting", null);
__decorate([
    (0, common_1.Post)('register-and-admit'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: "Enregistrer un nouveau patient dans Accueil puis l'admettre au bloc" }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_and_admit_patient_dto_1.RegisterAndAdmitPatientDto, Object]),
    __metadata("design:returntype", void 0)
], PatientBlocController.prototype, "registerAndAdmit", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les fiches de suivi bloc (enrichies avec l\'identité Accueil)' }),
    (0, swagger_1.ApiQuery)({ name: 'statut', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'niveauUrgence', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'recherche', required: false, description: 'Recherche locale par idDossier uniquement — utiliser /patients/search pour rechercher par nom' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limite', required: false }),
    __param(0, (0, common_1.Query)('statut')),
    __param(1, (0, common_1.Query)('niveauUrgence')),
    __param(2, (0, common_1.Query)('recherche')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limite')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number]),
    __metadata("design:returntype", void 0)
], PatientBlocController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':patientId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir une fiche de suivi bloc par id patient' }),
    __param(0, (0, common_1.Param)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PatientBlocController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':patientId'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier une fiche de suivi bloc' }),
    __param(0, (0, common_1.Param)('patientId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_patient_bloc_dto_1.UpdatePatientBlocDto]),
    __metadata("design:returntype", void 0)
], PatientBlocController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':patientId'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer une fiche de suivi bloc' }),
    __param(0, (0, common_1.Param)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PatientBlocController.prototype, "remove", null);
exports.PatientBlocController = PatientBlocController = __decorate([
    (0, swagger_1.ApiTags)('Patients'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('patients'),
    __metadata("design:paramtypes", [patient_bloc_service_1.PatientBlocService])
], PatientBlocController);
//# sourceMappingURL=patient-bloc.controller.js.map