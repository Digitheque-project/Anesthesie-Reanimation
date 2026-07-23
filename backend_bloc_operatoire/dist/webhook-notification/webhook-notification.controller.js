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
const public_decorator_1 = require("../central-auth/public.decorator");
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
    async getUnreadCount() {
        const count = await this.service.getUnreadCount();
        return { unread: count };
    }
    async getNotification(id) {
        return this.service.findOne(id);
    }
};
exports.WebhookNotificationController = WebhookNotificationController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: '📨 Recevoir une notification externe' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification reçue avec succès' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-notification-service')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WebhookNotificationController.prototype, "receivePost", null);
__decorate([
    (0, common_1.Get)('unread/count'),
    (0, swagger_1.ApiOperation)({ summary: 'Nombre de notifications non lues' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WebhookNotificationController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir les détails d’une notification par ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WebhookNotificationController.prototype, "getNotification", null);
exports.WebhookNotificationController = WebhookNotificationController = WebhookNotificationController_1 = __decorate([
    (0, swagger_1.ApiTags)('WebhookNotification'),
    (0, common_1.Controller)('webhook-notification'),
    __metadata("design:paramtypes", [webhook_notification_service_1.WebhookNotificationService])
], WebhookNotificationController);
//# sourceMappingURL=webhook-notification.controller.js.map