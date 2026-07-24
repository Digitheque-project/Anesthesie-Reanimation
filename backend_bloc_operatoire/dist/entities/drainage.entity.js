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
exports.Drainage = exports.CoteDrainage = exports.ModeDrainage = exports.TypeDrainage = void 0;
const typeorm_1 = require("typeorm");
const protocole_operatoire_entity_1 = require("./protocole-operatoire.entity");
var TypeDrainage;
(function (TypeDrainage) {
    TypeDrainage["SONDE_NASO_GASTRIQUE"] = "SONDE_NASO_GASTRIQUE";
    TypeDrainage["DRAIN_CRANE"] = "DRAIN_CRANE";
    TypeDrainage["DRAIN_THORAX"] = "DRAIN_THORAX";
    TypeDrainage["DRAIN_ABDOMEN"] = "DRAIN_ABDOMEN";
})(TypeDrainage || (exports.TypeDrainage = TypeDrainage = {}));
var ModeDrainage;
(function (ModeDrainage) {
    ModeDrainage["SIPHON"] = "SIPHON";
    ModeDrainage["ASPIRATION"] = "ASPIRATION";
    ModeDrainage["REDON"] = "REDON";
})(ModeDrainage || (exports.ModeDrainage = ModeDrainage = {}));
var CoteDrainage;
(function (CoteDrainage) {
    CoteDrainage["GAUCHE"] = "GAUCHE";
    CoteDrainage["DROITE"] = "DROITE";
})(CoteDrainage || (exports.CoteDrainage = CoteDrainage = {}));
let Drainage = class Drainage {
    id;
    type;
    mode;
    cote;
    protocole;
};
exports.Drainage = Drainage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Drainage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TypeDrainage }),
    __metadata("design:type", String)
], Drainage.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ModeDrainage }),
    __metadata("design:type", String)
], Drainage.prototype, "mode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: CoteDrainage, nullable: true }),
    __metadata("design:type", String)
], Drainage.prototype, "cote", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => protocole_operatoire_entity_1.ProtocoleOperatoire, (protocole) => protocole.drainages, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", protocole_operatoire_entity_1.ProtocoleOperatoire)
], Drainage.prototype, "protocole", void 0);
exports.Drainage = Drainage = __decorate([
    (0, typeorm_1.Entity)('drainages')
], Drainage);
//# sourceMappingURL=drainage.entity.js.map