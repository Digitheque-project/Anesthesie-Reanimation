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
var WebhookNotificationController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookNotificationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const webhook_notification_service_1 = require("./webhook-notification.service");
const receive_notification_dto_1 = require("./dto/receive-notification.dto");
let WebhookNotificationController = WebhookNotificationController_1 = class WebhookNotificationController {
    service;
    logger = new common_1.Logger(WebhookNotificationController_1.name);
    constructor(service) {
        this.service = service;
    }
    async receivePost(payload, source) {
        const sourceName = source || payload.sourceServiceName || 'service externe';
        this.logger.log(`📨 POST notification reçue de ${sourceName}`);
        const result = await this.service.processIncomingNotification(payload, sourceName);
        return { received: true, processed: result, method: 'POST', timestamp: new Date().toISOString() };
    }
    async receiveGet(type, targetId, message, source) {
        const payload = { type, targetId, message, source };
        const result = await this.service.processIncomingNotification(payload, source || 'GET');
        return { received: true, processed: result, method: 'GET', timestamp: new Date().toISOString() };
    }
};
exports.WebhookNotificationController = WebhookNotificationController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: '📨 Recevoir une notification externe (POST) - Format standard' }),
    (0, swagger_1.ApiBody)({ type: receive_notification_dto_1.ReceiveNotificationDto, description: 'Notification au format standard' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification reçue avec succès' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-notification-service')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [receive_notification_dto_1.ReceiveNotificationDto, String]),
    __metadata("design:returntype", Promise)
], WebhookNotificationController.prototype, "receivePost", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '🔔 Recevoir une notification externe via GET (legacy)' }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'targetId', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'message', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'source', required: false }),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('targetId')),
    __param(2, (0, common_1.Query)('message')),
    __param(3, (0, common_1.Query)('source')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], WebhookNotificationController.prototype, "receiveGet", null);
exports.WebhookNotificationController = WebhookNotificationController = WebhookNotificationController_1 = __decorate([
    (0, swagger_1.ApiTags)('WebhookNotification'),
    (0, common_1.Controller)('webhook-notification'),
    __metadata("design:paramtypes", [webhook_notification_service_1.WebhookNotificationService])
], WebhookNotificationController);
//# sourceMappingURL=webhook-notification.controller.js.map