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
exports.ReceiveDemandeCpaDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class ReceiveDemandeCpaDto {
    patientId;
    sourceServiceId;
    sourceServiceName;
    sourceCallbackUrl;
    sourceReferenceType;
    sourceReferenceId;
    typeAnesthesie;
    motif;
    urgence;
    dateExamenSouhaitee;
}
exports.ReceiveDemandeCpaDto = ReceiveDemandeCpaDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Identifiant du patient (identique à celui utilisé par le service Accueil).',
        example: 'CHU-2026-00099',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiveDemandeCpaDto.prototype, "patientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Identifiant du service demandeur (tel qu'enregistré dans le registre central des services).",
        example: 'a6ae8016-678c-4e13-b9d7-0afd735702d8',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiveDemandeCpaDto.prototype, "sourceServiceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Nom lisible du service demandeur, à titre d'affichage.",
        example: 'Endoscopie',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiveDemandeCpaDto.prototype, "sourceServiceName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'URL complète à laquelle POSTer le résultat de la CPA/VPA une fois réalisée (recommandé). ' +
            "Le Bloc Opératoire y enverra un POST JSON { type: 'CPA_RESULTAT'|'VPA_REALISEE', patientId, entiteRefType, entiteRefId, payload, ... } " +
            "dès que la décision est rendue. Sans cette URL, le résultat n'est pas transmis automatiquement (sauf intégration historique Endoscopie).",
        example: 'https://mon-service.exemple.com/notifications/receive',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({ require_tld: false }),
    __metadata("design:type", String)
], ReceiveDemandeCpaDto.prototype, "sourceCallbackUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type de référence métier côté service demandeur (ex: "examen", "consultation").',
        example: 'examen',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiveDemandeCpaDto.prototype, "sourceReferenceType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Identifiant de cette référence côté service demandeur — renvoyé tel quel dans le callback de résultat pour corrélation.',
        example: 'EXM-2026-0456',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiveDemandeCpaDto.prototype, "sourceReferenceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Type d'anesthésie envisagé pour l'acte.",
        example: 'Sédation',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiveDemandeCpaDto.prototype, "typeAnesthesie", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Motif de la demande de CPA/VPA.',
        example: 'Coloscopie sous sédation',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiveDemandeCpaDto.prototype, "motif", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Niveau d'urgence, de 1 (faible) à 5 (STAT/immédiat).",
        example: 2,
        minimum: 1,
        maximum: 5,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], ReceiveDemandeCpaDto.prototype, "urgence", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Date souhaitée pour l'examen/acte (indicative pour la planification CPA).",
        example: '2026-08-01',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ReceiveDemandeCpaDto.prototype, "dateExamenSouhaitee", void 0);
//# sourceMappingURL=receive-demande-cpa.dto.js.map