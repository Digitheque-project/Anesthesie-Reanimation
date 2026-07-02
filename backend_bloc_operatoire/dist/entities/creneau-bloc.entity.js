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
exports.CreneauBloc = exports.TypeRDV = exports.StatutCreneau = void 0;
const typeorm_1 = require("typeorm");
const medecin_entity_1 = require("./medecin.entity");
var StatutCreneau;
(function (StatutCreneau) {
    StatutCreneau["PLANIFIE"] = "PLANIFIE";
    StatutCreneau["EN_COURS"] = "EN_COURS";
    StatutCreneau["TERMINE"] = "TERMINE";
    StatutCreneau["ANNULE"] = "ANNULE";
})(StatutCreneau || (exports.StatutCreneau = StatutCreneau = {}));
var TypeRDV;
(function (TypeRDV) {
    TypeRDV["CPA"] = "CPA";
    TypeRDV["VPA"] = "VPA";
})(TypeRDV || (exports.TypeRDV = TypeRDV = {}));
let CreneauBloc = class CreneauBloc {
    id;
    date;
    heureDebut;
    heureFin;
    salle;
    patientId;
    chirurgien;
    chirurgienId;
    statut;
    estUrgence;
    type;
    createdAt;
};
exports.CreneauBloc = CreneauBloc;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CreneauBloc.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], CreneauBloc.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time' }),
    __metadata("design:type", String)
], CreneauBloc.prototype, "heureDebut", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time' }),
    __metadata("design:type", String)
], CreneauBloc.prototype, "heureFin", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], CreneauBloc.prototype, "salle", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CreneauBloc.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => medecin_entity_1.Medecin, { eager: true }),
    __metadata("design:type", medecin_entity_1.Medecin)
], CreneauBloc.prototype, "chirurgien", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CreneauBloc.prototype, "chirurgienId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: StatutCreneau, default: StatutCreneau.PLANIFIE }),
    __metadata("design:type", String)
], CreneauBloc.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], CreneauBloc.prototype, "estUrgence", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TypeRDV, default: TypeRDV.CPA }),
    __metadata("design:type", String)
], CreneauBloc.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CreneauBloc.prototype, "createdAt", void 0);
exports.CreneauBloc = CreneauBloc = __decorate([
    (0, typeorm_1.Entity)('creneaux_bloc')
], CreneauBloc);
//# sourceMappingURL=creneau-bloc.entity.js.map