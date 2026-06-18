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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WebhookNotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookNotificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const webhook_notification_entity_1 = require("../entities/webhook-notification.entity");
let WebhookNotificationService = WebhookNotificationService_1 = class WebhookNotificationService {
    webhookRepo;
    logger = new common_1.Logger(WebhookNotificationService_1.name);
    constructor(webhookRepo) {
        this.webhookRepo = webhookRepo;
    }
    async processIncomingNotification(payload, sourceService) {
        this.logger.log(`📦 Webhook reçu: ${JSON.stringify(payload)}`);
        try {
            const notification = this.webhookRepo.create({
                type: payload.type,
                motif: payload.motif || payload.message,
                patientId: payload.patientId || payload.targetId,
                sourceServiceId: payload.sourceServiceId,
                sourceServiceName: payload.sourceServiceName || sourceService,
                targetServiceId: payload.targetServiceId,
                targetServiceName: payload.targetServiceName,
                urgence: payload.urgence,
                payload: payload.payload,
                channels: payload.channels,
                processed: true,
            });
            await this.webhookRepo.save(notification);
            this.logger.log(`✅ Notification stockée dans table dédiée (ID: ${notification.id})`);
            return true;
        }
        catch (error) {
            this.logger.error(`❌ Erreur: ${error.message}`);
            return true;
        }
    }
};
exports.WebhookNotificationService = WebhookNotificationService;
exports.WebhookNotificationService = WebhookNotificationService = WebhookNotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(webhook_notification_entity_1.WebhookNotification)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], WebhookNotificationService);
//# sourceMappingURL=webhook-notification.service.js.map