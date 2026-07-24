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
exports.ProtocoleOperatoire = void 0;
const typeorm_1 = require("typeorm");
const drainage_entity_1 = require("./drainage.entity");
let ProtocoleOperatoire = class ProtocoleOperatoire {
    id;
    patientId;
    dateOperation;
    chirurgienId;
    anesthesisteId;
    infirmiereId;
    aideOperatoireId;
    compteRenduIntervention;
    surveillance;
    drainages;
    prescriptions;
    prescriptionsConjointes;
    createdAt;
    updatedAt;
};
exports.ProtocoleOperatoire = ProtocoleOperatoire;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ProtocoleOperatoire.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProtocoleOperatoire.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], ProtocoleOperatoire.prototype, "dateOperation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], ProtocoleOperatoire.prototype, "chirurgienId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], ProtocoleOperatoire.prototype, "anesthesisteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], ProtocoleOperatoire.prototype, "infirmiereId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], ProtocoleOperatoire.prototype, "aideOperatoireId", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], ProtocoleOperatoire.prototype, "compteRenduIntervention", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json'),
    __metadata("design:type", Object)
], ProtocoleOperatoire.prototype, "surveillance", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => drainage_entity_1.Drainage, (d) => d.protocole, { cascade: true }),
    __metadata("design:type", Array)
], ProtocoleOperatoire.prototype, "drainages", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json'),
    __metadata("design:type", Object)
], ProtocoleOperatoire.prototype, "prescriptions", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ProtocoleOperatoire.prototype, "prescriptionsConjointes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ProtocoleOperatoire.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ProtocoleOperatoire.prototype, "updatedAt", void 0);
exports.ProtocoleOperatoire = ProtocoleOperatoire = __decorate([
    (0, typeorm_1.Entity)('protocoles_operatoires')
], ProtocoleOperatoire);
//# sourceMappingURL=protocole-operatoire.entity.js.map