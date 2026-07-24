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
exports.ChecklistPendantOp = exports.StatutChecklist = void 0;
const typeorm_1 = require("typeorm");
var StatutChecklist;
(function (StatutChecklist) {
    StatutChecklist["EN_COURS"] = "EN_COURS";
    StatutChecklist["VALIDE"] = "VALIDE";
})(StatutChecklist || (exports.StatutChecklist = StatutChecklist = {}));
let ChecklistPendantOp = class ChecklistPendantOp {
    id;
    patientId;
    dateCreation;
    identiteUltimeConfirmee;
    interventionConfirmee;
    siteOperatoireConfirme;
    installationCorrecte;
    documentsDisponibles;
    antibioprophylaxieFaite;
    constantesStables;
    ventilationOK;
    statut;
    validateurId;
    validateurNom;
    validateurRole;
    createdAt;
    updatedAt;
};
exports.ChecklistPendantOp = ChecklistPendantOp;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ChecklistPendantOp.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ChecklistPendantOp.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], ChecklistPendantOp.prototype, "dateCreation", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ChecklistPendantOp.prototype, "identiteUltimeConfirmee", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ChecklistPendantOp.prototype, "interventionConfirmee", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ChecklistPendantOp.prototype, "siteOperatoireConfirme", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ChecklistPendantOp.prototype, "installationCorrecte", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ChecklistPendantOp.prototype, "documentsDisponibles", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ChecklistPendantOp.prototype, "antibioprophylaxieFaite", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ChecklistPendantOp.prototype, "constantesStables", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ChecklistPendantOp.prototype, "ventilationOK", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: StatutChecklist,
        default: StatutChecklist.EN_COURS,
    }),
    __metadata("design:type", String)
], ChecklistPendantOp.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], ChecklistPendantOp.prototype, "validateurId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], ChecklistPendantOp.prototype, "validateurNom", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], ChecklistPendantOp.prototype, "validateurRole", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ChecklistPendantOp.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ChecklistPendantOp.prototype, "updatedAt", void 0);
exports.ChecklistPendantOp = ChecklistPendantOp = __decorate([
    (0, typeorm_1.Entity)('checklists_pendant_op')
], ChecklistPendantOp);
//# sourceMappingURL=checklist-pendant-op.entity.js.map