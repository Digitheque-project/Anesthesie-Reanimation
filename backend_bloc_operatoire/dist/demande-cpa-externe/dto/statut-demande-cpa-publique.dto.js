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
exports.StatutDemandeCpaPubliqueDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const demande_cpa_externe_entity_1 = require("../../entities/demande-cpa-externe.entity");
const cpa_entity_1 = require("../../entities/cpa.entity");
class StatutDemandeCpaPubliqueDto {
    id;
    patientId;
    sourceReferenceId;
    statut;
    cpaId;
    vpaId;
    dateCpaPlanifiee;
    dateVpaPlanifiee;
    decision;
    dateCpa;
    observations;
    motifRefus;
}
exports.StatutDemandeCpaPubliqueDto = StatutDemandeCpaPubliqueDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Identifiant de la demande (celui renvoyé par POST /receive).' }),
    __metadata("design:type", String)
], StatutDemandeCpaPubliqueDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Identifiant du patient, tel que transmis à la création de la demande." }),
    __metadata("design:type", String)
], StatutDemandeCpaPubliqueDto.prototype, "patientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Référence métier côté service demandeur (sourceReferenceId fourni à la création).' }),
    __metadata("design:type", String)
], StatutDemandeCpaPubliqueDto.prototype, "sourceReferenceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: demande_cpa_externe_entity_1.StatutDemandeCpaExterne,
        description: 'État de la demande côté bloc (EN_ATTENTE, CPA_PLANIFIEE, CPA_REALISEE, VPA_PLANIFIEE, VPA_REALISEE, CONFIRMEE, REPORTEE, ANNULEE).',
    }),
    __metadata("design:type", String)
], StatutDemandeCpaPubliqueDto.prototype, "statut", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Identifiant de la CPA une fois réalisée (interne au bloc, non consultable directement).', nullable: true }),
    __metadata("design:type", Object)
], StatutDemandeCpaPubliqueDto.prototype, "cpaId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Identifiant de la vérification veille une fois réalisée (interne au bloc, non consultable directement).', nullable: true }),
    __metadata("design:type", Object)
], StatutDemandeCpaPubliqueDto.prototype, "vpaId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Date/heure du rendez-vous CPA planifié, si applicable.', nullable: true }),
    __metadata("design:type", Object)
], StatutDemandeCpaPubliqueDto.prototype, "dateCpaPlanifiee", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Date/heure du rendez-vous de vérification veille planifié, si applicable.', nullable: true }),
    __metadata("design:type", Object)
], StatutDemandeCpaPubliqueDto.prototype, "dateVpaPlanifiee", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: cpa_entity_1.DecisionCPA,
        description: "Décision d'aptitude une fois la CPA réalisée (APTE/INAPTE/REPORT). null tant que non réalisée.",
        nullable: true,
    }),
    __metadata("design:type", Object)
], StatutDemandeCpaPubliqueDto.prototype, "decision", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Date de la consultation CPA réalisée. null tant que non réalisée.', nullable: true }),
    __metadata("design:type", Object)
], StatutDemandeCpaPubliqueDto.prototype, "dateCpa", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Observations/notes d'incidents saisies pendant la CPA. null tant que non réalisée.", nullable: true }),
    __metadata("design:type", Object)
], StatutDemandeCpaPubliqueDto.prototype, "observations", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Motif du refus ou du report — toujours renseigné quand decision vaut INAPTE ou REPORT, c'est l'information la plus importante à lire dans ces deux cas. null si APTE ou CPA non encore réalisée.",
        nullable: true,
    }),
    __metadata("design:type", Object)
], StatutDemandeCpaPubliqueDto.prototype, "motifRefus", void 0);
//# sourceMappingURL=statut-demande-cpa-publique.dto.js.map