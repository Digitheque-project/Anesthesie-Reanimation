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
exports.CPA = exports.StatutCPA = exports.DecisionCPA = exports.ScoreASA = void 0;
const typeorm_1 = require("typeorm");
const medecin_entity_1 = require("./medecin.entity");
const premedicament_entity_1 = require("./premedicament.entity");
var ScoreASA;
(function (ScoreASA) {
    ScoreASA[ScoreASA["ASA_1"] = 1] = "ASA_1";
    ScoreASA[ScoreASA["ASA_2"] = 2] = "ASA_2";
    ScoreASA[ScoreASA["ASA_3"] = 3] = "ASA_3";
    ScoreASA[ScoreASA["ASA_4"] = 4] = "ASA_4";
    ScoreASA[ScoreASA["ASA_5"] = 5] = "ASA_5";
    ScoreASA[ScoreASA["ASA_6"] = 6] = "ASA_6";
    ScoreASA["E"] = "E";
})(ScoreASA || (exports.ScoreASA = ScoreASA = {}));
var DecisionCPA;
(function (DecisionCPA) {
    DecisionCPA["APTE"] = "APTE";
    DecisionCPA["INAPTE"] = "INAPTE";
    DecisionCPA["REPORT"] = "REPORT";
})(DecisionCPA || (exports.DecisionCPA = DecisionCPA = {}));
var StatutCPA;
(function (StatutCPA) {
    StatutCPA["EN_ATTENTE"] = "EN_ATTENTE";
    StatutCPA["REALISE"] = "REALISE";
})(StatutCPA || (exports.StatutCPA = StatutCPA = {}));
let CPA = class CPA {
    id;
    patientId;
    anesthesiste;
    anesthesisteId;
    dateConsultation;
    antecedentsAnesthesie;
    notesIncidents;
    frequenceCardiaque;
    tensionArterielle;
    taille;
    poids;
    examenCardiovasculaire;
    examenPulmonaire;
    examenNeurologique;
    colorationConjonctivale;
    abordVeineux;
    rachis;
    mallampati;
    ouvertureBuccale;
    distanceMentoThyroidienne;
    dents;
    tabac;
    alcool;
    scoreASA;
    decision;
    typeAnesthesie;
    techniqueIntubation;
    premedicaments;
    jeune;
    preparationPhysique;
    tachesInfirmieres;
    dateVPA;
    statut;
    createdAt;
    updatedAt;
};
exports.CPA = CPA;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CPA.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CPA.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => medecin_entity_1.Medecin, { eager: true }),
    __metadata("design:type", medecin_entity_1.Medecin)
], CPA.prototype, "anesthesiste", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CPA.prototype, "anesthesisteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], CPA.prototype, "dateConsultation", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], CPA.prototype, "antecedentsAnesthesie", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], CPA.prototype, "notesIncidents", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], CPA.prototype, "frequenceCardiaque", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json'),
    __metadata("design:type", Object)
], CPA.prototype, "tensionArterielle", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], CPA.prototype, "taille", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], CPA.prototype, "poids", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], CPA.prototype, "examenCardiovasculaire", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], CPA.prototype, "examenPulmonaire", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], CPA.prototype, "examenNeurologique", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], CPA.prototype, "colorationConjonctivale", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], CPA.prototype, "abordVeineux", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], CPA.prototype, "rachis", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], CPA.prototype, "mallampati", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], CPA.prototype, "ouvertureBuccale", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], CPA.prototype, "distanceMentoThyroidienne", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], CPA.prototype, "dents", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], CPA.prototype, "tabac", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], CPA.prototype, "alcool", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ScoreASA }),
    __metadata("design:type", Object)
], CPA.prototype, "scoreASA", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: DecisionCPA }),
    __metadata("design:type", String)
], CPA.prototype, "decision", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CPA.prototype, "typeAnesthesie", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CPA.prototype, "techniqueIntubation", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => premedicament_entity_1.Premedicament, (premed) => premed.cpa, { cascade: true }),
    __metadata("design:type", Array)
], CPA.prototype, "premedicaments", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CPA.prototype, "jeune", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], CPA.prototype, "preparationPhysique", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], CPA.prototype, "tachesInfirmieres", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], CPA.prototype, "dateVPA", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: StatutCPA, default: StatutCPA.EN_ATTENTE }),
    __metadata("design:type", String)
], CPA.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CPA.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CPA.prototype, "updatedAt", void 0);
exports.CPA = CPA = __decorate([
    (0, typeorm_1.Entity)('cpa')
], CPA);
//# sourceMappingURL=cpa.entity.js.map