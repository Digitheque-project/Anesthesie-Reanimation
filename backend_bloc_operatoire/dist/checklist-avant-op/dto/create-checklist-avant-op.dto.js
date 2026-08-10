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
exports.CreateChecklistAvantOpDto = void 0;
const class_validator_1 = require("class-validator");
class CreateChecklistAvantOpDto {
    patientId;
    dateCreation;
    identiteConfirmee;
    interventionSiteConfirmes;
    documentationDisponible;
    installationConnue;
    materielChirurgicalVerifie;
    materielAnesthesiqueVerifie;
    allergiePatient;
    risqueIntubation;
    risqueSaignement;
    notesChirurgicales;
    notesAnesthesiques;
    notesIdeIbode;
}
exports.CreateChecklistAvantOpDto = CreateChecklistAvantOpDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChecklistAvantOpDto.prototype, "patientId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateChecklistAvantOpDto.prototype, "dateCreation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateChecklistAvantOpDto.prototype, "identiteConfirmee", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateChecklistAvantOpDto.prototype, "interventionSiteConfirmes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateChecklistAvantOpDto.prototype, "documentationDisponible", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateChecklistAvantOpDto.prototype, "installationConnue", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateChecklistAvantOpDto.prototype, "materielChirurgicalVerifie", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateChecklistAvantOpDto.prototype, "materielAnesthesiqueVerifie", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateChecklistAvantOpDto.prototype, "allergiePatient", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateChecklistAvantOpDto.prototype, "risqueIntubation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateChecklistAvantOpDto.prototype, "risqueSaignement", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChecklistAvantOpDto.prototype, "notesChirurgicales", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChecklistAvantOpDto.prototype, "notesAnesthesiques", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChecklistAvantOpDto.prototype, "notesIdeIbode", void 0);
//# sourceMappingURL=create-checklist-avant-op.dto.js.map