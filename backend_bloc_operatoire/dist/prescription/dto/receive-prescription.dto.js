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
exports.ReceivePrescriptionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ItemPrescriptionDto {
    nom;
    dosage;
    posologie;
    duree;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Doliprane', description: 'Nom du médicament/produit' }),
    __metadata("design:type", String)
], ItemPrescriptionDto.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '500mg', description: 'Dosage' }),
    __metadata("design:type", String)
], ItemPrescriptionDto.prototype, "dosage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2 fois par jour', description: 'Posologie' }),
    __metadata("design:type", String)
], ItemPrescriptionDto.prototype, "posologie", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5, description: 'Durée en jours' }),
    __metadata("design:type", Number)
], ItemPrescriptionDto.prototype, "duree", void 0);
class ReceivePrescriptionDto {
    idPrescriptionSource;
    patientIdSource;
    patientId;
    type;
    items;
    prescripteur;
    datePrescription;
    metadata;
}
exports.ReceivePrescriptionDto = ReceivePrescriptionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'P-2026-001', description: 'ID de la prescription source' }),
    __metadata("design:type", String)
], ReceivePrescriptionDto.prototype, "idPrescriptionSource", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'PATIENT-001', description: 'ID patient dans le service Prescription' }),
    __metadata("design:type", String)
], ReceivePrescriptionDto.prototype, "patientIdSource", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'patient-uuid-block', description: 'ID patient dans le Bloc Opératoire' }),
    __metadata("design:type", String)
], ReceivePrescriptionDto.prototype, "patientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: ['MEDICALE', 'BLOC', 'LABO', 'IMAGERIE', 'ANAPATH', 'EEG', 'KINE', 'DIALYSE', 'ENDOSCOPIE', 'NON_MEDICALE', 'SURVEILLANCE', 'TRANSFUSION'],
        example: 'BLOC',
        description: 'Type de prescription'
    }),
    __metadata("design:type", String)
], ReceivePrescriptionDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ItemPrescriptionDto] }),
    __metadata("design:type", Array)
], ReceivePrescriptionDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Dr. Rakoto', description: 'Prescripteur' }),
    __metadata("design:type", String)
], ReceivePrescriptionDto.prototype, "prescripteur", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-06-15T10:00:00Z' }),
    __metadata("design:type", String)
], ReceivePrescriptionDto.prototype, "datePrescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Informations supplémentaires' }),
    __metadata("design:type", Object)
], ReceivePrescriptionDto.prototype, "metadata", void 0);
//# sourceMappingURL=receive-prescription.dto.js.map