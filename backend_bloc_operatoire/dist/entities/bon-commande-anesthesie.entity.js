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
exports.BonCommandeAnesthesie = exports.StatutBonCommande = void 0;
const typeorm_1 = require("typeorm");
const verification_veille_entity_1 = require("./verification-veille.entity");
const item_commande_entity_1 = require("./item-commande.entity");
var StatutBonCommande;
(function (StatutBonCommande) {
    StatutBonCommande["EN_ATTENTE"] = "EN_ATTENTE";
    StatutBonCommande["VALIDE"] = "VALIDE";
})(StatutBonCommande || (exports.StatutBonCommande = StatutBonCommande = {}));
let BonCommandeAnesthesie = class BonCommandeAnesthesie {
    id;
    patientId;
    verificationVeille;
    verificationVeilleId;
    chirurgienId;
    anesthesisteId;
    dateCreation;
    items;
    consommables;
    statut;
    createdAt;
    updatedAt;
};
exports.BonCommandeAnesthesie = BonCommandeAnesthesie;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BonCommandeAnesthesie.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BonCommandeAnesthesie.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => verification_veille_entity_1.VerificationVeille, { eager: true }),
    __metadata("design:type", verification_veille_entity_1.VerificationVeille)
], BonCommandeAnesthesie.prototype, "verificationVeille", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BonCommandeAnesthesie.prototype, "verificationVeilleId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BonCommandeAnesthesie.prototype, "chirurgienId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BonCommandeAnesthesie.prototype, "anesthesisteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], BonCommandeAnesthesie.prototype, "dateCreation", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => item_commande_entity_1.ItemCommande, (item) => item.bonCommande, { cascade: true }),
    __metadata("design:type", Array)
], BonCommandeAnesthesie.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array'),
    __metadata("design:type", Array)
], BonCommandeAnesthesie.prototype, "consommables", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: StatutBonCommande,
        default: StatutBonCommande.EN_ATTENTE,
    }),
    __metadata("design:type", String)
], BonCommandeAnesthesie.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], BonCommandeAnesthesie.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], BonCommandeAnesthesie.prototype, "updatedAt", void 0);
exports.BonCommandeAnesthesie = BonCommandeAnesthesie = __decorate([
    (0, typeorm_1.Entity)('bons_commande')
], BonCommandeAnesthesie);
//# sourceMappingURL=bon-commande-anesthesie.entity.js.map