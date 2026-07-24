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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationCPAController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notification_cpa_service_1 = require("./notification-cpa.service");
const create_notification_cpa_dto_1 = require("./dto/create-notification-cpa.dto");
const update_notification_cpa_dto_1 = require("./dto/update-notification-cpa.dto");
let NotificationCPAController = class NotificationCPAController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(d) {
        return this.service.create(d);
    }
    findAll(p, l) {
        return this.service.findAll(p, l);
    }
    async getUnreadCount() {
        const count = await this.service.getUnreadCount();
        return { unread: count };
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    update(id, d) {
        return this.service.update(id, d);
    }
    planifier(id, dto) {
        return this.service.planifierRDV(id, dto);
    }
    remove(id) {
        return this.service.remove(id);
    }
};
exports.NotificationCPAController = NotificationCPAController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une notification' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_notification_cpa_dto_1.CreateNotificationCPADto]),
    __metadata("design:returntype", void 0)
], NotificationCPAController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les notifications' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limite')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], NotificationCPAController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('unread/count'),
    (0, swagger_1.ApiOperation)({
        summary: 'Nombre de notifications non lues (pour la cloche)',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationCPAController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir une notification' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NotificationCPAController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier une notification' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_notification_cpa_dto_1.UpdateNotificationCPADto]),
    __metadata("design:returntype", void 0)
], NotificationCPAController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/planifier'),
    (0, swagger_1.ApiOperation)({ summary: 'Planifier un RDV' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], NotificationCPAController.prototype, "planifier", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer une notification' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NotificationCPAController.prototype, "remove", null);
exports.NotificationCPAController = NotificationCPAController = __decorate([
    (0, swagger_1.ApiTags)('Notifications'),
    (0, common_1.Controller)('notifications-cpa'),
    __metadata("design:paramtypes", [notification_cpa_service_1.NotificationCPAService])
], NotificationCPAController);
//# sourceMappingURL=notification-cpa.controller.js.map