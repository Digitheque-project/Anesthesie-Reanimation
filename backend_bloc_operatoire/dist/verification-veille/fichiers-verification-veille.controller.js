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
exports.FichiersVerificationVeilleController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const multer_1 = require("multer");
const require_role_decorator_1 = require("../central-auth/require-role.decorator");
const role_clinique_1 = require("../central-auth/role-clinique");
const fichiers_verification_veille_service_1 = require("./fichiers-verification-veille.service");
const TAILLE_MAX_FICHIER = 20 * 1024 * 1024;
let FichiersVerificationVeilleController = class FichiersVerificationVeilleController {
    service;
    constructor(service) {
        this.service = service;
    }
    upload(fichier, patientId, req) {
        if (!patientId) {
            throw new common_1.BadRequestException('patientId requis (champ de formulaire).');
        }
        return this.service.upload(fichier, patientId, req.centralUser?.userId);
    }
    lister(patientId) {
        return this.service.listerParPatient(patientId);
    }
    async contenu(id) {
        const fichier = await this.service.trouverAvecContenu(id);
        return {
            id: fichier.id,
            nomOriginal: fichier.nomOriginal,
            mimeType: fichier.mimeType,
            base64: fichier.contenu.toString('base64'),
        };
    }
    supprimer(id) {
        return this.service.supprimer(id);
    }
};
exports.FichiersVerificationVeilleController = FichiersVerificationVeilleController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.ANESTHESISTE, role_clinique_1.RoleClinique.MAJOR),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('fichier', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: TAILLE_MAX_FICHIER },
    })),
    (0, swagger_1.ApiOperation)({
        summary: "Importer un fichier pour un patient (PDF, image, Office...) — Anesthésiste ou Major",
    }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('patientId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], FichiersVerificationVeilleController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.ANESTHESISTE, role_clinique_1.RoleClinique.MAJOR),
    (0, swagger_1.ApiOperation)({
        summary: 'Lister les fichiers importés pour un patient',
    }),
    __param(0, (0, common_1.Query)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FichiersVerificationVeilleController.prototype, "lister", null);
__decorate([
    (0, common_1.Get)(':id/contenu'),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.ANESTHESISTE, role_clinique_1.RoleClinique.MAJOR),
    (0, swagger_1.ApiOperation)({
        summary: "Récupérer le contenu (base64) d'un fichier importé",
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FichiersVerificationVeilleController.prototype, "contenu", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_role_decorator_1.RequireRoleClinique)(role_clinique_1.RoleClinique.ANESTHESISTE, role_clinique_1.RoleClinique.MAJOR),
    (0, swagger_1.ApiOperation)({
        summary: "Supprimer un fichier importé pour un patient",
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FichiersVerificationVeilleController.prototype, "supprimer", null);
exports.FichiersVerificationVeilleController = FichiersVerificationVeilleController = __decorate([
    (0, swagger_1.ApiTags)('Vérification veille — pièces jointes'),
    (0, common_1.Controller)('verification-veille/fichiers'),
    __metadata("design:paramtypes", [fichiers_verification_veille_service_1.FichiersVerificationVeilleService])
], FichiersVerificationVeilleController);
//# sourceMappingURL=fichiers-verification-veille.controller.js.map