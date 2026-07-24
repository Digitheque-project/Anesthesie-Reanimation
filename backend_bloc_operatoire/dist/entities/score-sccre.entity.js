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
exports.ScoreSCCRE = exports.StatutScoreSCCRE = void 0;
const typeorm_1 = require("typeorm");
var StatutScoreSCCRE;
(function (StatutScoreSCCRE) {
    StatutScoreSCCRE["EN_COURS"] = "EN_COURS";
    StatutScoreSCCRE["VALIDE"] = "VALIDE";
})(StatutScoreSCCRE || (exports.StatutScoreSCCRE = StatutScoreSCCRE = {}));
let ScoreSCCRE = class ScoreSCCRE {
    id;
    patientId;
    anesthesisteId;
    heureArrivee;
    dateEvaluation;
    motricite;
    respiration;
    pressionArterielle;
    etatConscience;
    coloration;
    scoreTotal;
    calculerScoreTotal() {
        this.scoreTotal = +this.motricite + +this.respiration + +this.pressionArterielle + +this.etatConscience + +this.coloration;
    }
    evs;
    eqa;
    eva;
    etatInitial;
    reponse;
    sortieAutorisee;
    statut;
    createdAt;
    updatedAt;
};
exports.ScoreSCCRE = ScoreSCCRE;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ScoreSCCRE.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ScoreSCCRE.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ScoreSCCRE.prototype, "anesthesisteId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ScoreSCCRE.prototype, "heureArrivee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], ScoreSCCRE.prototype, "dateEvaluation", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], ScoreSCCRE.prototype, "motricite", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], ScoreSCCRE.prototype, "respiration", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], ScoreSCCRE.prototype, "pressionArterielle", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], ScoreSCCRE.prototype, "etatConscience", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], ScoreSCCRE.prototype, "coloration", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], ScoreSCCRE.prototype, "scoreTotal", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ScoreSCCRE.prototype, "calculerScoreTotal", null);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], ScoreSCCRE.prototype, "evs", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], ScoreSCCRE.prototype, "eqa", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], ScoreSCCRE.prototype, "eva", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json'),
    __metadata("design:type", Object)
], ScoreSCCRE.prototype, "etatInitial", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json'),
    __metadata("design:type", Object)
], ScoreSCCRE.prototype, "reponse", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ScoreSCCRE.prototype, "sortieAutorisee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: StatutScoreSCCRE, default: StatutScoreSCCRE.EN_COURS }),
    __metadata("design:type", String)
], ScoreSCCRE.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ScoreSCCRE.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ScoreSCCRE.prototype, "updatedAt", void 0);
exports.ScoreSCCRE = ScoreSCCRE = __decorate([
    (0, typeorm_1.Entity)('scores_sccre')
], ScoreSCCRE);
//# sourceMappingURL=score-sccre.entity.js.map