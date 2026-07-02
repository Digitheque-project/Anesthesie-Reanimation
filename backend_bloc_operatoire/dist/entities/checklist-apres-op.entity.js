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
exports.ChecklistApresOp = exports.StatutChecklist = void 0;
const typeorm_1 = require("typeorm");
var StatutChecklist;
(function (StatutChecklist) {
    StatutChecklist["EN_COURS"] = "EN_COURS";
    StatutChecklist["VALIDE"] = "VALIDE";
})(StatutChecklist || (exports.StatutChecklist = StatutChecklist = {}));
let ChecklistApresOp = class ChecklistApresOp {
    id;
    patientId;
    dateCreation;
    interventionEnregistree;
    compteFinalCorrect;
    etiquetageVerifie;
    signalementsEffectues;
    transfertSalleReveil;
    observationsParticulieres;
    statut;
    createdAt;
    updatedAt;
};
exports.ChecklistApresOp = ChecklistApresOp;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ChecklistApresOp.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ChecklistApresOp.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], ChecklistApresOp.prototype, "dateCreation", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ChecklistApresOp.prototype, "interventionEnregistree", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ChecklistApresOp.prototype, "compteFinalCorrect", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ChecklistApresOp.prototype, "etiquetageVerifie", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ChecklistApresOp.prototype, "signalementsEffectues", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ChecklistApresOp.prototype, "transfertSalleReveil", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ChecklistApresOp.prototype, "observationsParticulieres", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: StatutChecklist, default: StatutChecklist.EN_COURS }),
    __metadata("design:type", String)
], ChecklistApresOp.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ChecklistApresOp.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ChecklistApresOp.prototype, "updatedAt", void 0);
exports.ChecklistApresOp = ChecklistApresOp = __decorate([
    (0, typeorm_1.Entity)('checklists_apres_op')
], ChecklistApresOp);
//# sourceMappingURL=checklist-apres-op.entity.js.map