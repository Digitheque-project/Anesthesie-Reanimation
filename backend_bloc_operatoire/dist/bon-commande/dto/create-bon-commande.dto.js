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
exports.CreateBonCommandeDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const bon_commande_anesthesie_entity_1 = require("../../entities/bon-commande-anesthesie.entity");
class ItemDto {
    nom;
    selectionne;
    quantite;
    dosage;
    observation;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ItemDto.prototype, "nom", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ItemDto.prototype, "selectionne", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ItemDto.prototype, "quantite", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ItemDto.prototype, "dosage", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ItemDto.prototype, "observation", void 0);
class CreateBonCommandeDto {
    patientId;
    verificationVeilleId;
    chirurgienId;
    anesthesisteId;
    dateCreation;
    items;
    consommables;
    statut;
}
exports.CreateBonCommandeDto = CreateBonCommandeDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBonCommandeDto.prototype, "patientId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBonCommandeDto.prototype, "verificationVeilleId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBonCommandeDto.prototype, "chirurgienId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBonCommandeDto.prototype, "anesthesisteId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateBonCommandeDto.prototype, "dateCreation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ItemDto),
    __metadata("design:type", Array)
], CreateBonCommandeDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateBonCommandeDto.prototype, "consommables", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(bon_commande_anesthesie_entity_1.StatutBonCommande),
    __metadata("design:type", String)
], CreateBonCommandeDto.prototype, "statut", void 0);
//# sourceMappingURL=create-bon-commande.dto.js.map