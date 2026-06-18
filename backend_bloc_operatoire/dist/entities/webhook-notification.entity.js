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
exports.WebhookNotification = void 0;
const typeorm_1 = require("typeorm");
let WebhookNotification = class WebhookNotification {
    id;
    type;
    motif;
    patientId;
    sourceServiceId;
    sourceServiceName;
    targetServiceId;
    targetServiceName;
    urgence;
    payload;
    channels;
    processed;
    receivedAt;
};
exports.WebhookNotification = WebhookNotification;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], WebhookNotification.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], WebhookNotification.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], WebhookNotification.prototype, "motif", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], WebhookNotification.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], WebhookNotification.prototype, "sourceServiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], WebhookNotification.prototype, "sourceServiceName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], WebhookNotification.prototype, "targetServiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], WebhookNotification.prototype, "targetServiceName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], WebhookNotification.prototype, "urgence", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], WebhookNotification.prototype, "payload", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], WebhookNotification.prototype, "channels", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], WebhookNotification.prototype, "processed", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'receivedAt' }),
    __metadata("design:type", Date)
], WebhookNotification.prototype, "receivedAt", void 0);
exports.WebhookNotification = WebhookNotification = __decorate([
    (0, typeorm_1.Entity)('webhook_notifications')
], WebhookNotification);
//# sourceMappingURL=webhook-notification.entity.js.map