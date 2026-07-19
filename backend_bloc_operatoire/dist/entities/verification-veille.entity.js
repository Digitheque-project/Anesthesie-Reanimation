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
exports.VerificationVeille = exports.StatutVerificationVeille = void 0;
const typeorm_1 = require("typeorm");
const cpa_entity_1 = require("./cpa.entity");
const medecin_entity_1 = require("./medecin.entity");
var StatutVerificationVeille;
(function (StatutVerificationVeille) {
    StatutVerificationVeille["EN_ATTENTE"] = "EN_ATTENTE";
    StatutVerificationVeille["VALIDE"] = "VALIDE";
})(StatutVerificationVeille || (exports.StatutVerificationVeille = StatutVerificationVeille = {}));
let VerificationVeille = class VerificationVeille {
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
exports.VerificationVeille = VerificationVeille;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VerificationVeille.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], VerificationVeille.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cpa_entity_1.CPA, { eager: true, nullable: true }),
    __metadata("design:type", cpa_entity_1.CPA)
], VerificationVeille.prototype, "cpa", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], VerificationVeille.prototype, "cpaId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => medecin_entity_1.Medecin, { eager: true, nullable: true }),
    __metadata("design:type", medecin_entity_1.Medecin)
], VerificationVeille.prototype, "anesthesiste", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], VerificationVeille.prototype, "anesthesisteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], VerificationVeille.prototype, "dateVisite", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VerificationVeille.prototype, "identiteConfirmee", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VerificationVeille.prototype, "jeuneRespected", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VerificationVeille.prototype, "instructionsRespectees", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VerificationVeille.prototype, "premedicationFaite", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], VerificationVeille.prototype, "jeune", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], VerificationVeille.prototype, "examensComplementaires", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], VerificationVeille.prototype, "commandeSang", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], VerificationVeille.prototype, "heureDepart", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: StatutVerificationVeille, default: StatutVerificationVeille.EN_ATTENTE }),
    __metadata("design:type", String)
], VerificationVeille.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], VerificationVeille.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], VerificationVeille.prototype, "updatedAt", void 0);
exports.VerificationVeille = VerificationVeille = __decorate([
    (0, typeorm_1.Entity)('verifications_veille')
], VerificationVeille);
//# sourceMappingURL=verification-veille.entity.js.map