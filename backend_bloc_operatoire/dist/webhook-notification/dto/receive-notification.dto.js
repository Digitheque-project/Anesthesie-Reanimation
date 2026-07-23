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
exports.ReceiveNotificationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class ReceiveNotificationDto {
    type;
    motif;
    sourceServiceId;
    sourceServiceName;
    targetServiceId;
    targetServiceName;
    urgence;
    patientId;
    payload;
    channels;
}
exports.ReceiveNotificationDto = ReceiveNotificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'MEDICAL_ALERT', description: 'Type de notification' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiveNotificationDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Patient en détresse', description: 'Motif de la notification' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiveNotificationDto.prototype, "motif", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'service-bloc-operatoire', description: 'ID du service source' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiveNotificationDto.prototype, "sourceServiceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Bloc opératoire', description: 'Nom du service source' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiveNotificationDto.prototype, "sourceServiceName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'service-urgence', description: 'ID du service cible' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiveNotificationDto.prototype, "targetServiceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Urgence', description: 'Nom du service cible' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiveNotificationDto.prototype, "targetServiceName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2, description: "Niveau d'urgence (1 = faible, 2 = moyen, 3 = élevé)" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiveNotificationDto.prototype, "urgence", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'patient-123', description: 'ID du patient concerné' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiveNotificationDto.prototype, "patientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: { salle: 'A123', operation: 'appendicectomie' }, description: 'Données supplémentaires' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ReceiveNotificationDto.prototype, "payload", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['SOUND', 'WEB'], description: 'Canaux de notification' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ReceiveNotificationDto.prototype, "channels", void 0);
//# sourceMappingURL=receive-notification.dto.js.map