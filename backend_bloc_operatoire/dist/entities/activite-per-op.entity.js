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
exports.ActivitePerOp = void 0;
const typeorm_1 = require("typeorm");
const constante_per_op_entity_1 = require("./constante-per-op.entity");
let ActivitePerOp = class ActivitePerOp {
    id;
    patientId;
    chirurgienId;
    anesthesisteId;
    dateOperation;
    perfusions;
    transfusions;
    journalSorties;
    constantes;
    intubationOT;
    sArme;
    masqueLarynge;
    ventilation;
    etatArrivee;
    createdAt;
    updatedAt;
};
exports.ActivitePerOp = ActivitePerOp;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ActivitePerOp.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ActivitePerOp.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Object)
], ActivitePerOp.prototype, "chirurgienId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Object)
], ActivitePerOp.prototype, "anesthesisteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], ActivitePerOp.prototype, "dateOperation", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], ActivitePerOp.prototype, "perfusions", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], ActivitePerOp.prototype, "transfusions", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], ActivitePerOp.prototype, "journalSorties", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => constante_per_op_entity_1.ConstantePerOp, (c) => c.activitePerOp, { cascade: true }),
    __metadata("design:type", Array)
], ActivitePerOp.prototype, "constantes", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ActivitePerOp.prototype, "intubationOT", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ActivitePerOp.prototype, "sArme", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ActivitePerOp.prototype, "masqueLarynge", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], ActivitePerOp.prototype, "ventilation", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], ActivitePerOp.prototype, "etatArrivee", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ActivitePerOp.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ActivitePerOp.prototype, "updatedAt", void 0);
exports.ActivitePerOp = ActivitePerOp = __decorate([
    (0, typeorm_1.Entity)('activites_per_op')
], ActivitePerOp);
//# sourceMappingURL=activite-per-op.entity.js.map