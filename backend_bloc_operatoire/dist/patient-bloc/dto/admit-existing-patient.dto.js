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
exports.AdmitExistingPatientDto = void 0;
const class_validator_1 = require("class-validator");
const patient_bloc_entity_1 = require("../../entities/patient-bloc.entity");
class AdmitExistingPatientDto {
    patientId;
    idDossier;
    groupeSanguin;
    libelle;
    risqueHemorragique;
    typeChirurgie;
    consignes;
    dateIntervention;
    alertes;
    prescripteurId;
    chirurgien_nom;
    niveauUrgence;
    statut;
    chambre;
}
exports.AdmitExistingPatientDto = AdmitExistingPatientDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdmitExistingPatientDto.prototype, "patientId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 50),
    __metadata("design:type", String)
], AdmitExistingPatientDto.prototype, "idDossier", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdmitExistingPatientDto.prototype, "groupeSanguin", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdmitExistingPatientDto.prototype, "libelle", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdmitExistingPatientDto.prototype, "risqueHemorragique", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdmitExistingPatientDto.prototype, "typeChirurgie", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdmitExistingPatientDto.prototype, "consignes", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AdmitExistingPatientDto.prototype, "dateIntervention", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdmitExistingPatientDto.prototype, "alertes", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdmitExistingPatientDto.prototype, "prescripteurId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdmitExistingPatientDto.prototype, "chirurgien_nom", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(patient_bloc_entity_1.NiveauUrgence),
    __metadata("design:type", String)
], AdmitExistingPatientDto.prototype, "niveauUrgence", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(patient_bloc_entity_1.PatientStatut),
    __metadata("design:type", String)
], AdmitExistingPatientDto.prototype, "statut", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdmitExistingPatientDto.prototype, "chambre", void 0);
//# sourceMappingURL=admit-existing-patient.dto.js.map