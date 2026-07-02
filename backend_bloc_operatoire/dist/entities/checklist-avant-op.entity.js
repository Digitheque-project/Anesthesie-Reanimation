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
exports.ChecklistAvantOp = exports.StatutChecklist = void 0;
const typeorm_1 = require("typeorm");
var StatutChecklist;
(function (StatutChecklist) {
    StatutChecklist["EN_COURS"] = "EN_COURS";
    StatutChecklist["VALIDE"] = "VALIDE";
})(StatutChecklist || (exports.StatutChecklist = StatutChecklist = {}));
let ChecklistAvantOp = class ChecklistAvantOp {
    id;
    patientId;
    dateCreation;
    identiteConfirmee;
    interventionSiteConfirmes;
    documentationDisponible;
    installationConnue;
    materielChirurgicalVerifie;
    materielAnesthesiqueVerifie;
    allergiePatient;
    risqueIntubation;
    risqueSaignement;
    medicamentsRemplis;
    statut;
    createdAt;
    updatedAt;
};
exports.ChecklistAvantOp = ChecklistAvantOp;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ChecklistAvantOp.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ChecklistAvantOp.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], ChecklistAvantOp.prototype, "dateCreation", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ChecklistAvantOp.prototype, "identiteConfirmee", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ChecklistAvantOp.prototype, "interventionSiteConfirmes", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ChecklistAvantOp.prototype, "documentationDisponible", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ChecklistAvantOp.prototype, "installationConnue", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ChecklistAvantOp.prototype, "materielChirurgicalVerifie", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ChecklistAvantOp.prototype, "materielAnesthesiqueVerifie", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ChecklistAvantOp.prototype, "allergiePatient", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ChecklistAvantOp.prototype, "risqueIntubation", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ChecklistAvantOp.prototype, "risqueSaignement", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ChecklistAvantOp.prototype, "medicamentsRemplis", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: StatutChecklist, default: StatutChecklist.EN_COURS }),
    __metadata("design:type", String)
], ChecklistAvantOp.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ChecklistAvantOp.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ChecklistAvantOp.prototype, "updatedAt", void 0);
exports.ChecklistAvantOp = ChecklistAvantOp = __decorate([
    (0, typeorm_1.Entity)('checklists_avant_op')
], ChecklistAvantOp);
//# sourceMappingURL=checklist-avant-op.entity.js.map