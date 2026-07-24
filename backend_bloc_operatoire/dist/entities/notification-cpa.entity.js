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
exports.NotificationCPA = exports.StatutNotificationCPA = void 0;
const typeorm_1 = require("typeorm");
var StatutNotificationCPA;
(function (StatutNotificationCPA) {
    StatutNotificationCPA["EN_ATTENTE"] = "EN_ATTENTE";
    StatutNotificationCPA["RDV_PLANIFIE"] = "RDV_PLANIFIE";
    StatutNotificationCPA["REALISE"] = "REALISE";
})(StatutNotificationCPA || (exports.StatutNotificationCPA = StatutNotificationCPA = {}));
let NotificationCPA = class NotificationCPA {
    id;
    heurePrescription;
    dateIntervention;
    patientId;
    intervention;
    chirurgienId;
    chirurgienNom;
    professeurCPA;
    estUrgent;
    statut;
    createdAt;
    updatedAt;
};
exports.NotificationCPA = NotificationCPA;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], NotificationCPA.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NotificationCPA.prototype, "heurePrescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], NotificationCPA.prototype, "dateIntervention", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NotificationCPA.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NotificationCPA.prototype, "intervention", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], NotificationCPA.prototype, "chirurgienId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], NotificationCPA.prototype, "chirurgienNom", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], NotificationCPA.prototype, "professeurCPA", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], NotificationCPA.prototype, "estUrgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: StatutNotificationCPA, default: StatutNotificationCPA.EN_ATTENTE }),
    __metadata("design:type", String)
], NotificationCPA.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], NotificationCPA.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], NotificationCPA.prototype, "updatedAt", void 0);
exports.NotificationCPA = NotificationCPA = __decorate([
    (0, typeorm_1.Entity)('notifications_cpa')
], NotificationCPA);
//# sourceMappingURL=notification-cpa.entity.js.map