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
exports.DemandeCpaExterne = exports.StatutDemandeCpaExterne = void 0;
const typeorm_1 = require("typeorm");
var StatutDemandeCpaExterne;
(function (StatutDemandeCpaExterne) {
    StatutDemandeCpaExterne["EN_ATTENTE"] = "EN_ATTENTE";
    StatutDemandeCpaExterne["CPA_PLANIFIEE"] = "CPA_PLANIFIEE";
    StatutDemandeCpaExterne["CPA_REALISEE"] = "CPA_REALISEE";
    StatutDemandeCpaExterne["VPA_PLANIFIEE"] = "VPA_PLANIFIEE";
    StatutDemandeCpaExterne["VPA_REALISEE"] = "VPA_REALISEE";
    StatutDemandeCpaExterne["CONFIRMEE"] = "CONFIRMEE";
    StatutDemandeCpaExterne["REPORTEE"] = "REPORTEE";
    StatutDemandeCpaExterne["ANNULEE"] = "ANNULEE";
})(StatutDemandeCpaExterne || (exports.StatutDemandeCpaExterne = StatutDemandeCpaExterne = {}));
let DemandeCpaExterne = class DemandeCpaExterne {
    id;
    patientId;
    chuId;
    sourceServiceId;
    sourceServiceName;
    sourceCallbackUrl;
    sourceReferenceType;
    sourceReferenceId;
    typeAnesthesie;
    motif;
    urgence;
    dateExamenSouhaitee;
    statut;
    dateCpaPlanifiee;
    dateVpaPlanifiee;
    cpaId;
    vpaId;
    payload;
    createdAt;
    updatedAt;
};
exports.DemandeCpaExterne = DemandeCpaExterne;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DemandeCpaExterne.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], DemandeCpaExterne.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], DemandeCpaExterne.prototype, "chuId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], DemandeCpaExterne.prototype, "sourceServiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], DemandeCpaExterne.prototype, "sourceServiceName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", Object)
], DemandeCpaExterne.prototype, "sourceCallbackUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], DemandeCpaExterne.prototype, "sourceReferenceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], DemandeCpaExterne.prototype, "sourceReferenceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], DemandeCpaExterne.prototype, "typeAnesthesie", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], DemandeCpaExterne.prototype, "motif", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], DemandeCpaExterne.prototype, "urgence", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], DemandeCpaExterne.prototype, "dateExamenSouhaitee", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: StatutDemandeCpaExterne,
        default: StatutDemandeCpaExterne.EN_ATTENTE,
    }),
    __metadata("design:type", String)
], DemandeCpaExterne.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], DemandeCpaExterne.prototype, "dateCpaPlanifiee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], DemandeCpaExterne.prototype, "dateVpaPlanifiee", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], DemandeCpaExterne.prototype, "cpaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], DemandeCpaExterne.prototype, "vpaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], DemandeCpaExterne.prototype, "payload", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DemandeCpaExterne.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], DemandeCpaExterne.prototype, "updatedAt", void 0);
exports.DemandeCpaExterne = DemandeCpaExterne = __decorate([
    (0, typeorm_1.Entity)('demandes_cpa_externes')
], DemandeCpaExterne);
//# sourceMappingURL=demande-cpa-externe.entity.js.map