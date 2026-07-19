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
exports.PlanifierDemandeCpaDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const creneau_bloc_entity_1 = require("../../entities/creneau-bloc.entity");
class PlanifierDemandeCpaDto {
    type;
    date;
    heureDebut;
    heureFin;
    salle;
    chirurgienId;
    responsable;
}
exports.PlanifierDemandeCpaDto = PlanifierDemandeCpaDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: creneau_bloc_entity_1.TypeRDV, description: "CPA (défaut) pour la consultation initiale, VERIFICATION_VEILLE pour le contrôle la veille de l'intervention.", default: creneau_bloc_entity_1.TypeRDV.CPA }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(creneau_bloc_entity_1.TypeRDV),
    __metadata("design:type", String)
], PlanifierDemandeCpaDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-08-01' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], PlanifierDemandeCpaDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '09:00' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PlanifierDemandeCpaDto.prototype, "heureDebut", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '09:30' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PlanifierDemandeCpaDto.prototype, "heureFin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Salle CPA-1' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PlanifierDemandeCpaDto.prototype, "salle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PlanifierDemandeCpaDto.prototype, "chirurgienId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Nom libre du responsable si aucun médecin n\'est sélectionné.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PlanifierDemandeCpaDto.prototype, "responsable", void 0);
//# sourceMappingURL=planifier-demande-cpa.dto.js.map