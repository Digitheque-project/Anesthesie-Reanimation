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
exports.ReceiveDemandeCpaResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const demande_cpa_externe_entity_1 = require("../../entities/demande-cpa-externe.entity");
class ReceiveDemandeCpaResponseDto {
    received;
    id;
    statut;
    timestamp;
}
exports.ReceiveDemandeCpaResponseDto = ReceiveDemandeCpaResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], ReceiveDemandeCpaResponseDto.prototype, "received", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Identifiant de la demande créée — à conserver pour interroger GET /demandes-cpa-externes/:id/statut par la suite.',
        example: 'b3f1c9e0-1234-4a5b-8c9d-0e1f2a3b4c5d',
    }),
    __metadata("design:type", String)
], ReceiveDemandeCpaResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: demande_cpa_externe_entity_1.StatutDemandeCpaExterne, example: demande_cpa_externe_entity_1.StatutDemandeCpaExterne.EN_ATTENTE }),
    __metadata("design:type", String)
], ReceiveDemandeCpaResponseDto.prototype, "statut", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-07-28T10:00:00.000Z' }),
    __metadata("design:type", String)
], ReceiveDemandeCpaResponseDto.prototype, "timestamp", void 0);
//# sourceMappingURL=receive-demande-cpa-response.dto.js.map