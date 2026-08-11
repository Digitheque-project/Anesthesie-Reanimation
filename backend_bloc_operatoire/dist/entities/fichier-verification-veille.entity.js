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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FichierVerificationVeille = void 0;
const typeorm_1 = require("typeorm");
let FichierVerificationVeille = class FichierVerificationVeille {
    id;
    patientId;
    verificationVeilleId;
    nomOriginal;
    mimeType;
    tailleOctets;
    contenu;
    telechargeParId;
    createdAt;
    updatedAt;
};
exports.FichierVerificationVeille = FichierVerificationVeille;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FichierVerificationVeille.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FichierVerificationVeille.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], FichierVerificationVeille.prototype, "verificationVeilleId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FichierVerificationVeille.prototype, "nomOriginal", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FichierVerificationVeille.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], FichierVerificationVeille.prototype, "tailleOctets", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bytea' }),
    __metadata("design:type", Buffer)
], FichierVerificationVeille.prototype, "contenu", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], FichierVerificationVeille.prototype, "telechargeParId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], FichierVerificationVeille.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], FichierVerificationVeille.prototype, "updatedAt", void 0);
exports.FichierVerificationVeille = FichierVerificationVeille = __decorate([
    (0, typeorm_1.Entity)('fichiers_verification_veille')
], FichierVerificationVeille);
//# sourceMappingURL=fichier-verification-veille.entity.js.map