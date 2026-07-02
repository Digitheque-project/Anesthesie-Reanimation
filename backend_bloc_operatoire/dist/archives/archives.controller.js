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
exports.ArchivesController = void 0;
const common_1 = require("@nestjs/common");
const archives_service_1 = require("./archives.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ArchivesController = class ArchivesController {
    archivesService;
    constructor(archivesService) {
        this.archivesService = archivesService;
    }
    getDossierComplet(patientId) {
        return this.archivesService.getDossierComplet(patientId);
    }
    getResumePatient(patientId) {
        return this.archivesService.getResumePatient(patientId);
    }
};
exports.ArchivesController = ArchivesController;
__decorate([
    (0, common_1.Get)('dossier/:patientId'),
    __param(0, (0, common_1.Param)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ArchivesController.prototype, "getDossierComplet", null);
__decorate([
    (0, common_1.Get)('resume/:patientId'),
    __param(0, (0, common_1.Param)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ArchivesController.prototype, "getResumePatient", null);
exports.ArchivesController = ArchivesController = __decorate([
    (0, common_1.Controller)('archives'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [archives_service_1.ArchivesService])
], ArchivesController);
//# sourceMappingURL=archives.controller.js.map