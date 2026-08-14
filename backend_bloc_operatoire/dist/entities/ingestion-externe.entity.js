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
exports.IngestionExterne = exports.CanalIngestion = void 0;
const typeorm_1 = require("typeorm");
var CanalIngestion;
(function (CanalIngestion) {
    CanalIngestion["PRESCRIPTION_BLOC"] = "PRESCRIPTION_BLOC";
    CanalIngestion["PRESCRIPTION_IMAGERIE"] = "PRESCRIPTION_IMAGERIE";
    CanalIngestion["WEBHOOK_SERVICE"] = "WEBHOOK_SERVICE";
})(CanalIngestion || (exports.CanalIngestion = CanalIngestion = {}));
let IngestionExterne = class IngestionExterne {
    id;
    canal;
    referenceExterne;
    patientId;
    serviceSourceId;
    libelle;
    ingereeLe;
};
exports.IngestionExterne = IngestionExterne;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], IngestionExterne.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: CanalIngestion }),
    __metadata("design:type", String)
], IngestionExterne.prototype, "canal", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 150 }),
    __metadata("design:type", String)
], IngestionExterne.prototype, "referenceExterne", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], IngestionExterne.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], IngestionExterne.prototype, "serviceSourceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], IngestionExterne.prototype, "libelle", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], IngestionExterne.prototype, "ingereeLe", void 0);
exports.IngestionExterne = IngestionExterne = __decorate([
    (0, typeorm_1.Entity)('ingestions_externes'),
    (0, typeorm_1.Unique)('UQ_ingestion_canal_reference', ['canal', 'referenceExterne'])
], IngestionExterne);
//# sourceMappingURL=ingestion-externe.entity.js.map