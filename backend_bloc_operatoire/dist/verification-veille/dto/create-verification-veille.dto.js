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
exports.CreateVerificationVeilleDto = void 0;
const class_validator_1 = require("class-validator");
const verification_veille_entity_1 = require("../../entities/verification-veille.entity");
class CreateVerificationVeilleDto {
    patientId;
    cpaId;
    anesthesisteId;
    dateVisite;
    identiteConfirmee;
    jeuneRespected;
    instructionsRespectees;
    premedicationFaite;
    jeune;
    examensComplementaires;
    commandeSang;
    heureDepart;
    medicamentsVerifies;
    statut;
}
exports.CreateVerificationVeilleDto = CreateVerificationVeilleDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVerificationVeilleDto.prototype, "patientId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVerificationVeilleDto.prototype, "cpaId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVerificationVeilleDto.prototype, "anesthesisteId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateVerificationVeilleDto.prototype, "dateVisite", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateVerificationVeilleDto.prototype, "identiteConfirmee", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateVerificationVeilleDto.prototype, "jeuneRespected", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateVerificationVeilleDto.prototype, "instructionsRespectees", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateVerificationVeilleDto.prototype, "premedicationFaite", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVerificationVeilleDto.prototype, "jeune", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVerificationVeilleDto.prototype, "examensComplementaires", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateVerificationVeilleDto.prototype, "commandeSang", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVerificationVeilleDto.prototype, "heureDepart", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateVerificationVeilleDto.prototype, "medicamentsVerifies", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(verification_veille_entity_1.StatutVerificationVeille),
    __metadata("design:type", String)
], CreateVerificationVeilleDto.prototype, "statut", void 0);
//# sourceMappingURL=create-verification-veille.dto.js.map