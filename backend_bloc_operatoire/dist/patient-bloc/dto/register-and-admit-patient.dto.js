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
exports.RegisterAndAdmitPatientDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const patient_bloc_entity_1 = require("../../entities/patient-bloc.entity");
const register_patient_dto_1 = require("../../external/dto/register-patient.dto");
class RegisterAndAdmitPatientDto {
    identite;
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
exports.RegisterAndAdmitPatientDto = RegisterAndAdmitPatientDto;
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => register_patient_dto_1.RegisterPatientDto),
    __metadata("design:type", register_patient_dto_1.RegisterPatientDto)
], RegisterAndAdmitPatientDto.prototype, "identite", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 50),
    __metadata("design:type", String)
], RegisterAndAdmitPatientDto.prototype, "idDossier", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterAndAdmitPatientDto.prototype, "groupeSanguin", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterAndAdmitPatientDto.prototype, "libelle", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterAndAdmitPatientDto.prototype, "risqueHemorragique", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterAndAdmitPatientDto.prototype, "typeChirurgie", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterAndAdmitPatientDto.prototype, "consignes", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], RegisterAndAdmitPatientDto.prototype, "dateIntervention", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterAndAdmitPatientDto.prototype, "alertes", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterAndAdmitPatientDto.prototype, "prescripteurId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterAndAdmitPatientDto.prototype, "chirurgien_nom", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(patient_bloc_entity_1.NiveauUrgence),
    __metadata("design:type", String)
], RegisterAndAdmitPatientDto.prototype, "niveauUrgence", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(patient_bloc_entity_1.PatientStatut),
    __metadata("design:type", String)
], RegisterAndAdmitPatientDto.prototype, "statut", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterAndAdmitPatientDto.prototype, "chambre", void 0);
//# sourceMappingURL=register-and-admit-patient.dto.js.map