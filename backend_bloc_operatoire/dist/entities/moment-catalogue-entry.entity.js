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
exports.MomentCatalogueEntry = void 0;
const typeorm_1 = require("typeorm");
const moment_operatoire_entity_1 = require("./moment-operatoire.entity");
let MomentCatalogueEntry = class MomentCatalogueEntry {
    id;
    categorie;
    label;
    creeParNom;
    createdAt;
};
exports.MomentCatalogueEntry = MomentCatalogueEntry;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MomentCatalogueEntry.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: 'enum', enum: moment_operatoire_entity_1.CategorieMoment }),
    __metadata("design:type", String)
], MomentCatalogueEntry.prototype, "categorie", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MomentCatalogueEntry.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], MomentCatalogueEntry.prototype, "creeParNom", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MomentCatalogueEntry.prototype, "createdAt", void 0);
exports.MomentCatalogueEntry = MomentCatalogueEntry = __decorate([
    (0, typeorm_1.Entity)('moments_catalogue')
], MomentCatalogueEntry);
//# sourceMappingURL=moment-catalogue-entry.entity.js.map