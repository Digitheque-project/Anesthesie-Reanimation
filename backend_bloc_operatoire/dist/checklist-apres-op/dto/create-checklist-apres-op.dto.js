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
exports.CreateChecklistApresOpDto = void 0;
const class_validator_1 = require("class-validator");
const checklist_apres_op_entity_1 = require("../../entities/checklist-apres-op.entity");
class CreateChecklistApresOpDto {
    patientId;
    dateCreation;
    interventionEnregistree;
    compteFinalCorrect;
    etiquetageVerifie;
    signalementsEffectues;
    transfertSalleReveil;
    observationsParticulieres;
    statut;
}
exports.CreateChecklistApresOpDto = CreateChecklistApresOpDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChecklistApresOpDto.prototype, "patientId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateChecklistApresOpDto.prototype, "dateCreation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateChecklistApresOpDto.prototype, "interventionEnregistree", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateChecklistApresOpDto.prototype, "compteFinalCorrect", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateChecklistApresOpDto.prototype, "etiquetageVerifie", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateChecklistApresOpDto.prototype, "signalementsEffectues", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateChecklistApresOpDto.prototype, "transfertSalleReveil", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChecklistApresOpDto.prototype, "observationsParticulieres", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(checklist_apres_op_entity_1.StatutChecklist),
    __metadata("design:type", String)
], CreateChecklistApresOpDto.prototype, "statut", void 0);
//# sourceMappingURL=create-checklist-apres-op.dto.js.map