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
const notification_cpa_entity_1 = require("../entities/notification-cpa.entity");
let WebhookNotificationService = WebhookNotificationService_1 = class WebhookNotificationService {
    notificationRepo;
    logger = new common_1.Logger(WebhookNotificationService_1.name);
    constructor(notificationRepo) {
        this.notificationRepo = notificationRepo;
    }
    async processIncomingNotification(payload, sourceService) {
        this.logger.log(`📦 Webhook reçu: ${JSON.stringify(payload)}`);
        try {
            const motif = payload.motif || payload.message || 'Notification externe';
            const patientId = payload.patientId || payload.targetId || 'webhook-inconnu';
            const urgence = payload.urgence === 3 || payload.estUrgent === true;
            const newNotification = this.notificationRepo.create({
                heurePrescription: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                patientId: patientId,
                intervention: motif,
                chirurgienId: payload.sourceServiceId || payload.chirurgienId || null,
                professeurCPA: payload.sourceServiceName || sourceService || 'Service externe',
                estUrgent: urgence,
                statut: notification_cpa_entity_1.StatutNotificationCPA.EN_ATTENTE,
            });
            const saved = await this.notificationRepo.save(newNotification);
            this.logger.log(`✅ Notification externe stockée (ID: ${saved.id})`);
            return true;
        }
        catch (error) {
            this.logger.error(`❌ Erreur stockage: ${error.message}`);
            return false;
        }
    }
};
exports.WebhookNotificationService = WebhookNotificationService;
exports.WebhookNotificationService = WebhookNotificationService = WebhookNotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_cpa_entity_1.NotificationCPA)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], WebhookNotificationService);
//# sourceMappingURL=webhook-notification.service.js.map