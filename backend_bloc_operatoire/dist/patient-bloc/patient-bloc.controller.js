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
const require_role_decorator_1 = require("../central-auth/require-role.decorator");
const role_clinique_1 = require("../central-auth/role-clinique");
const patient_bloc_service_1 = require("./patient-bloc.service");
const patient_bloc_statut_service_1 = require("./patient-bloc-statut.service");
const admit_existing_patient_dto_1 = require("./dto/admit-existing-patient.dto");
const register_and_admit_patient_dto_1 = require("./dto/register-and-admit-patient.dto");
const update_patient_bloc_dto_1 = require("./dto/update-patient-bloc.dto");
const update_date_intervention_dto_1 = require("./dto/update-date-intervention.dto");
let PatientBlocController = class PatientBlocController {
    patientBlocService;
    patientBlocStatutService;
    constructor(patientBlocService, patientBlocStatutService) {
        this.patientBlocService = patientBlocService;
        this.patientBlocStatutService = patientBlocStatutService;
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
        const createdBy = req.centralUser?.userId ?? req.centralUser?.email ?? 'unknown';
        return this.patientBlocService.registerAndAdmit(dto, createdBy);
    }
    findAll(statut, niveauUrgence, recherche, page, limite) {
        return this.patientBlocService.findAll({
            statut,
            niveauUrgence,
            recherche,
            page,
            limite,
        });
    }
    findOne(patientId) {
        return this.patientBlocService.findOne(patientId);
    }
    getDossierMedical(patientId, req) {
        const token = (req.headers?.authorization || '').replace(/^Bearer\s+/i, '');
        return this.patientBlocService.getDossierMedical(patientId, token);
    }
    getDossierComplet(patientId, req) {
        const token = (req.headers?.authorization || '').replace(/^Bearer\s+/i, '');
        return this.patientBlocService.getDossierComplet(patientId, token);
    }
    update(patientId, dto) {
        return this.patientBlocService.update(patientId, dto);
    }
    marquerApteCpa(patientId) {
        return this.patientBlocStatutService.marquerApteCpa(patientId);
    }
    marquerInapteCpa(patientId, motifRefus) {
        return this.patientBlocStatutService.marquerInapteCpa(patientId, motifRefus);
    }
    modifierDateIntervention(patientId, dto) {
        return this.patientBlocStatutService.modifierDateIntervention(patientId, dto.dateIntervention);
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
    (0, swagger_1.ApiOperation)({
        summary: 'Obtenir un patient depuis le service Accueil (avant admission)',
    }),
    __param(0, (0, common_1.Param)('externalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PatientBlocController.prototype, "getExternal", null);
__decorate([
    (0, common_1.Post)('admit'),
    (0, swagger_1.ApiOperation)({
        summary: 'Admettre au bloc un patient déjà enregistré dans Accueil',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admit_existing_patient_dto_1.AdmitExistingPatientDto]),
    __metadata("design:returntype", void 0)
], PatientBlocController.prototype, "admitExisting", null);
__decorate([
    (0, common_1.Post)('register-and-admit'),
    (0, swagger_1.ApiOperation)({
        summary: "Enregistrer un nouveau patient dans Accueil puis l'admettre au bloc",
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_and_admit_patient_dto_1.RegisterAndAdmitPatientDto, Object]),
    __metadata("design:returntype", void 0)
], PatientBlocController.prototype, "registerAndAdmit", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: "Lister les fiches de suivi bloc (enrichies avec l'identité Accueil)",
    }),
    (0, swagger_1.ApiQuery)({ name: 'statut', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'niveauUrgence', required: false }),
    (0, swagger_1.ApiQuery)({
        name: 'recherche',
        required: false,
        description: 'Recherche locale par idDossier uniquement — utiliser /patients/search pour rechercher par nom',
    }),
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
    (0, common_1.Get)(':patientId/dossier-medical'),
    (0, swagger_1.ApiOperation)({
        summary: 'Dossier médical partagé complet (antécédents, diagnostics, histoire de la maladie, alertes urgentes, dernier examen physique, examens complémentaires urgents, suivis)',
    }),
    __param(0, (0, common_1.Param)('patientId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PatientBlocController.prototype, "getDossierMedical", null);
__decorate([
    (0, common_1.Get)(':patientId/dossier-complet'),
    (0, swagger_1.ApiOperation)({
        summary: 'Dossier patient complet en lecture seule, organisé par onglets (observations, diagnostics, antécédents, histoire de la maladie, examens physiques, examens complémentaires, suivis, protocoles opératoires, sortie)',
    }),
    __param(0, (0, common_1.Param)('patientId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PatientBlocController.prototype, "getDossierComplet", null);
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
    (0, common_1.Patch)(':patientId/apte-cpa'),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.RESPONSABLE_CPA),
    (0, swagger_1.ApiOperation)({
        summary: 'Fil de prescription : marquer le patient apte au circuit CPA (Responsable CPA)',
    }),
    __param(0, (0, common_1.Param)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PatientBlocController.prototype, "marquerApteCpa", null);
__decorate([
    (0, common_1.Patch)(':patientId/inapte-cpa'),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.RESPONSABLE_CPA),
    (0, swagger_1.ApiOperation)({
        summary: 'Fil de prescription : marquer le patient inapte au circuit CPA (motif obligatoire, Responsable CPA)',
    }),
    __param(0, (0, common_1.Param)('patientId')),
    __param(1, (0, common_1.Body)('motifRefus')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PatientBlocController.prototype, "marquerInapteCpa", null);
__decorate([
    (0, common_1.Patch)(':patientId/date-intervention'),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.RESPONSABLE_CPA),
    (0, swagger_1.ApiOperation)({
        summary: "CPA : modifier la date et l'heure prévues de l'opération (Responsable CPA)",
    }),
    __param(0, (0, common_1.Param)('patientId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_date_intervention_dto_1.UpdateDateInterventionDto]),
    __metadata("design:returntype", void 0)
], PatientBlocController.prototype, "modifierDateIntervention", null);
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
    __metadata("design:paramtypes", [patient_bloc_service_1.PatientBlocService,
        patient_bloc_statut_service_1.PatientBlocStatutService])
], PatientBlocController);
//# sourceMappingURL=patient-bloc.controller.js.map