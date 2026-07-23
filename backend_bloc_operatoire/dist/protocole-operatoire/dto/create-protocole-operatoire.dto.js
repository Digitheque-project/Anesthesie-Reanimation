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
exports.CreateProtocoleOperatoireDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const drainage_entity_1 = require("../../entities/drainage.entity");
class DrainageDto {
    type;
    mode;
    cote;
}
__decorate([
    (0, class_validator_1.IsEnum)(drainage_entity_1.TypeDrainage),
    __metadata("design:type", String)
], DrainageDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(drainage_entity_1.ModeDrainage),
    __metadata("design:type", String)
], DrainageDto.prototype, "mode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(drainage_entity_1.CoteDrainage),
    __metadata("design:type", String)
], DrainageDto.prototype, "cote", void 0);
class CreateProtocoleOperatoireDto {
    patientId;
    dateOperation;
    chirurgienId;
    anesthesisteId;
    infirmiereId;
    aideOperatoireId;
    compteRenduIntervention;
    surveillance;
    drainages;
    prescriptions;
    prescriptionsConjointes;
}
exports.CreateProtocoleOperatoireDto = CreateProtocoleOperatoireDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProtocoleOperatoireDto.prototype, "patientId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateProtocoleOperatoireDto.prototype, "dateOperation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProtocoleOperatoireDto.prototype, "chirurgienId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProtocoleOperatoireDto.prototype, "anesthesisteId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProtocoleOperatoireDto.prototype, "infirmiereId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProtocoleOperatoireDto.prototype, "aideOperatoireId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProtocoleOperatoireDto.prototype, "compteRenduIntervention", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateProtocoleOperatoireDto.prototype, "surveillance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DrainageDto),
    __metadata("design:type", Array)
], CreateProtocoleOperatoireDto.prototype, "drainages", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateProtocoleOperatoireDto.prototype, "prescriptions", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateProtocoleOperatoireDto.prototype, "prescriptionsConjointes", void 0);
//# sourceMappingURL=create-protocole-operatoire.dto.js.map