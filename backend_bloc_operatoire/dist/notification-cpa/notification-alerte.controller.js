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
exports.NotificationAlerteController = void 0;
const common_1 = require("@nestjs/common");
const notification_alerte_service_1 = require("./notification-alerte.service");
let NotificationAlerteController = class NotificationAlerteController {
    service;
    constructor(service) {
        this.service = service;
    }
    getAlertes() {
        return this.service.getAlertesUrgentes();
    }
    getResumeJour() {
        return this.service.getResumeJour();
    }
};
exports.NotificationAlerteController = NotificationAlerteController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NotificationAlerteController.prototype, "getAlertes", null);
__decorate([
    (0, common_1.Get)('resume-jour'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NotificationAlerteController.prototype, "getResumeJour", null);
exports.NotificationAlerteController = NotificationAlerteController = __decorate([
    (0, common_1.Controller)('alertes'),
    __metadata("design:paramtypes", [notification_alerte_service_1.NotificationAlerteService])
], NotificationAlerteController);
//# sourceMappingURL=notification-alerte.controller.js.map