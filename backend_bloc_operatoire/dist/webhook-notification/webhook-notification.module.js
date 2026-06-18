"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookNotificationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const webhook_notification_entity_1 = require("../entities/webhook-notification.entity");
const webhook_notification_controller_1 = require("./webhook-notification.controller");
const webhook_notification_service_1 = require("./webhook-notification.service");
let WebhookNotificationModule = class WebhookNotificationModule {
};
exports.WebhookNotificationModule = WebhookNotificationModule;
exports.WebhookNotificationModule = WebhookNotificationModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([webhook_notification_entity_1.WebhookNotification])],
        controllers: [webhook_notification_controller_1.WebhookNotificationController],
        providers: [webhook_notification_service_1.WebhookNotificationService],
    })
], WebhookNotificationModule);
//# sourceMappingURL=webhook-notification.module.js.map