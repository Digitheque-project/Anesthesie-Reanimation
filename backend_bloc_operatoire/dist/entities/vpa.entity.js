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
exports.VPA = exports.StatutVPA = void 0;
const typeorm_1 = require("typeorm");
const cpa_entity_1 = require("./cpa.entity");
const medecin_entity_1 = require("./medecin.entity");
var StatutVPA;
(function (StatutVPA) {
    StatutVPA["EN_ATTENTE"] = "EN_ATTENTE";
    StatutVPA["VALIDE"] = "VALIDE";
})(StatutVPA || (exports.StatutVPA = StatutVPA = {}));
let VPA = class VPA {
    id;
    patientId;
    cpa;
    cpaId;
    anesthesiste;
    anesthesisteId;
    dateVisite;
    identiteConfirmee;
    jeuneRespected;
    instructionsRespectees;
    premedicationFaite;
    jeune;
    examensComplementaires;
    commandeSang;
    heureDepart;
    statut;
    createdAt;
    updatedAt;
};
exports.VPA = VPA;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VPA.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], VPA.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cpa_entity_1.CPA, { eager: true, nullable: true }),
    __metadata("design:type", cpa_entity_1.CPA)
], VPA.prototype, "cpa", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], VPA.prototype, "cpaId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => medecin_entity_1.Medecin, { eager: true, nullable: true }),
    __metadata("design:type", medecin_entity_1.Medecin)
], VPA.prototype, "anesthesiste", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], VPA.prototype, "anesthesisteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], VPA.prototype, "dateVisite", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VPA.prototype, "identiteConfirmee", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VPA.prototype, "jeuneRespected", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VPA.prototype, "instructionsRespectees", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VPA.prototype, "premedicationFaite", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], VPA.prototype, "jeune", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], VPA.prototype, "examensComplementaires", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], VPA.prototype, "commandeSang", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], VPA.prototype, "heureDepart", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: StatutVPA, default: StatutVPA.EN_ATTENTE }),
    __metadata("design:type", String)
], VPA.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], VPA.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], VPA.prototype, "updatedAt", void 0);
exports.VPA = VPA = __decorate([
    (0, typeorm_1.Entity)('vpa')
], VPA);
//# sourceMappingURL=vpa.entity.js.map