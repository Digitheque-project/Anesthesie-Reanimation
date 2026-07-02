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
exports.UpdateDemandeCpaDto = void 0;
const class_validator_1 = require("class-validator");
const demande_cpa_externe_entity_1 = require("../../entities/demande-cpa-externe.entity");
class UpdateDemandeCpaDto {
    statut;
    dateCpaPlanifiee;
    dateVpaPlanifiee;
}
exports.UpdateDemandeCpaDto = UpdateDemandeCpaDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(demande_cpa_externe_entity_1.StatutDemandeCpaExterne),
    __metadata("design:type", String)
], UpdateDemandeCpaDto.prototype, "statut", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateDemandeCpaDto.prototype, "dateCpaPlanifiee", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateDemandeCpaDto.prototype, "dateVpaPlanifiee", void 0);
//# sourceMappingURL=update-demande-cpa.dto.js.map