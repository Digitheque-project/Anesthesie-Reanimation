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
exports.CreateCPADto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const cpa_entity_1 = require("../../entities/cpa.entity");
class TensionArterielleDto {
    systolique;
    diastolique;
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TensionArterielleDto.prototype, "systolique", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TensionArterielleDto.prototype, "diastolique", void 0);
class PremedicamentDto {
    nom;
    dose;
    voieAdministration;
    debut;
    frequence;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PremedicamentDto.prototype, "nom", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PremedicamentDto.prototype, "dose", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PremedicamentDto.prototype, "voieAdministration", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PremedicamentDto.prototype, "debut", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PremedicamentDto.prototype, "frequence", void 0);
class MedicamentAnesthesieReanimationDto {
    categorie;
    nom;
    mode;
    dosage;
    nombre;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MedicamentAnesthesieReanimationDto.prototype, "categorie", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MedicamentAnesthesieReanimationDto.prototype, "nom", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['DOSAGE', 'QUANTITE']),
    __metadata("design:type", String)
], MedicamentAnesthesieReanimationDto.prototype, "mode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MedicamentAnesthesieReanimationDto.prototype, "dosage", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], MedicamentAnesthesieReanimationDto.prototype, "nombre", void 0);
class CreateCPADto {
    patientId;
    anesthesisteId;
    dateConsultation;
    antecedentsAnesthesie;
    notesIncidents;
    frequenceCardiaque;
    tensionArterielle;
    taille;
    poids;
    examenCardiovasculaire;
    examenPulmonaire;
    examenNeurologique;
    colorationConjonctivale;
    abordVeineux;
    rachis;
    mallampati;
    ouvertureBuccale;
    distanceMentoThyroidienne;
    dents;
    tabac;
    alcool;
    scoreASA;
    decision;
    typeAnesthesie;
    techniqueIntubation;
    premedicaments;
    medicamentsAnesthesieReanimation;
    jeune;
    preparationPhysique;
    tachesInfirmieres;
    dateVerificationVeille;
    statut;
    motifRefus;
    decisionOperation;
    validationProfInformelle;
}
exports.CreateCPADto = CreateCPADto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCPADto.prototype, "patientId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCPADto.prototype, "anesthesisteId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCPADto.prototype, "dateConsultation", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateCPADto.prototype, "antecedentsAnesthesie", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCPADto.prototype, "notesIncidents", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCPADto.prototype, "frequenceCardiaque", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => TensionArterielleDto),
    __metadata("design:type", Object)
], CreateCPADto.prototype, "tensionArterielle", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCPADto.prototype, "taille", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCPADto.prototype, "poids", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCPADto.prototype, "examenCardiovasculaire", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCPADto.prototype, "examenPulmonaire", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCPADto.prototype, "examenNeurologique", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCPADto.prototype, "colorationConjonctivale", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCPADto.prototype, "abordVeineux", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCPADto.prototype, "rachis", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCPADto.prototype, "mallampati", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCPADto.prototype, "ouvertureBuccale", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCPADto.prototype, "distanceMentoThyroidienne", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCPADto.prototype, "dents", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCPADto.prototype, "tabac", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCPADto.prototype, "alcool", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(cpa_entity_1.ScoreASA),
    __metadata("design:type", Object)
], CreateCPADto.prototype, "scoreASA", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(cpa_entity_1.DecisionCPA),
    __metadata("design:type", String)
], CreateCPADto.prototype, "decision", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCPADto.prototype, "typeAnesthesie", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCPADto.prototype, "techniqueIntubation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PremedicamentDto),
    __metadata("design:type", Array)
], CreateCPADto.prototype, "premedicaments", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => MedicamentAnesthesieReanimationDto),
    __metadata("design:type", Array)
], CreateCPADto.prototype, "medicamentsAnesthesieReanimation", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCPADto.prototype, "jeune", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCPADto.prototype, "preparationPhysique", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCPADto.prototype, "tachesInfirmieres", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCPADto.prototype, "dateVerificationVeille", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(cpa_entity_1.StatutCPA),
    __metadata("design:type", String)
], CreateCPADto.prototype, "statut", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCPADto.prototype, "motifRefus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(cpa_entity_1.DecisionOperation),
    __metadata("design:type", String)
], CreateCPADto.prototype, "decisionOperation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCPADto.prototype, "validationProfInformelle", void 0);
//# sourceMappingURL=create-cpa.dto.js.map