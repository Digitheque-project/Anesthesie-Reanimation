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
exports.SortieReveil = exports.StatutSortieReveil = void 0;
const typeorm_1 = require("typeorm");
const score_sccre_entity_1 = require("./score-sccre.entity");
const medecin_entity_1 = require("./medecin.entity");
var StatutSortieReveil;
(function (StatutSortieReveil) {
    StatutSortieReveil["EN_ATTENTE"] = "EN_ATTENTE";
    StatutSortieReveil["VALIDE"] = "VALIDE";
})(StatutSortieReveil || (exports.StatutSortieReveil = StatutSortieReveil = {}));
let SortieReveil = class SortieReveil {
    id;
    patientId;
    scoreSCCRE;
    scoreSCCREId;
    medecin;
    medecinId;
    dateHeureSortie;
    versServiceOrigine;
    autresServicesDestination;
    checklistSortie;
    statut;
    createdAt;
    updatedAt;
};
exports.SortieReveil = SortieReveil;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SortieReveil.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SortieReveil.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => score_sccre_entity_1.ScoreSCCRE, { eager: true }),
    __metadata("design:type", score_sccre_entity_1.ScoreSCCRE)
], SortieReveil.prototype, "scoreSCCRE", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SortieReveil.prototype, "scoreSCCREId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => medecin_entity_1.Medecin, { eager: true }),
    __metadata("design:type", medecin_entity_1.Medecin)
], SortieReveil.prototype, "medecin", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SortieReveil.prototype, "medecinId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], SortieReveil.prototype, "dateHeureSortie", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], SortieReveil.prototype, "versServiceOrigine", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], SortieReveil.prototype, "autresServicesDestination", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json'),
    __metadata("design:type", Object)
], SortieReveil.prototype, "checklistSortie", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: StatutSortieReveil, default: StatutSortieReveil.EN_ATTENTE }),
    __metadata("design:type", String)
], SortieReveil.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SortieReveil.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SortieReveil.prototype, "updatedAt", void 0);
exports.SortieReveil = SortieReveil = __decorate([
    (0, typeorm_1.Entity)('sorties_reveil')
], SortieReveil);
//# sourceMappingURL=sortie-reveil.entity.js.map