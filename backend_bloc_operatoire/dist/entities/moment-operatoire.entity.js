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
exports.MomentOperatoire = exports.CategorieMoment = void 0;
const typeorm_1 = require("typeorm");
var CategorieMoment;
(function (CategorieMoment) {
    CategorieMoment["ANESTHESIE"] = "ANESTHESIE";
    CategorieMoment["CHIRURGIE"] = "CHIRURGIE";
    CategorieMoment["DIVERS"] = "DIVERS";
})(CategorieMoment || (exports.CategorieMoment = CategorieMoment = {}));
let MomentOperatoire = class MomentOperatoire {
    id;
    patientId;
    label;
    categorie;
    estPersonnalise;
    horodatage;
    auteurId;
    auteurNom;
    auteurRole;
    annule;
    annuleLe;
    annuleParNom;
    enregistreLe;
};
exports.MomentOperatoire = MomentOperatoire;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MomentOperatoire.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MomentOperatoire.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MomentOperatoire.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: CategorieMoment }),
    __metadata("design:type", String)
], MomentOperatoire.prototype, "categorie", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], MomentOperatoire.prototype, "estPersonnalise", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], MomentOperatoire.prototype, "horodatage", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MomentOperatoire.prototype, "auteurId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MomentOperatoire.prototype, "auteurNom", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MomentOperatoire.prototype, "auteurRole", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], MomentOperatoire.prototype, "annule", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], MomentOperatoire.prototype, "annuleLe", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], MomentOperatoire.prototype, "annuleParNom", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MomentOperatoire.prototype, "enregistreLe", void 0);
exports.MomentOperatoire = MomentOperatoire = __decorate([
    (0, typeorm_1.Entity)('moments_operatoires')
], MomentOperatoire);
//# sourceMappingURL=moment-operatoire.entity.js.map