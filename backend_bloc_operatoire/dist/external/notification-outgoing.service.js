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
var NotificationOutgoingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationOutgoingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let NotificationOutgoingService = NotificationOutgoingService_1 = class NotificationOutgoingService {
    http;
    config;
    logger = new common_1.Logger(NotificationOutgoingService_1.name);
    blocServiceId;
    constructor(http, config) {
        this.http = http;
        this.config = config;
        this.blocServiceId =
            this.config.get('externalServices.serviceId') ?? '';
    }
    async notifyOriginService(params) {
        const { patientId, type, serviceOrigineId, serviceOrigineName, payload, notificationUrl, } = params;
        const url = notificationUrl ||
            this.config.get('externalServices.notificationOrigineUrl');
        if (!url) {
            this.logger.warn(`URL de notification origine non configurée, notification "${type}" pour patient ${patientId} ignorée`);
            return;
        }
        try {
            await (0, rxjs_1.firstValueFrom)(this.http.post(`${url}/notifications/receive`, {
                type,
                motif: `Statut CPA/VPA pour patient ${patientId}`,
                patientId,
                emitter: this.blocServiceId,
                emitterName: 'Bloc Opératoire',
                recipient: serviceOrigineId,
                recipientName: serviceOrigineName,
                payload,
                createdAt: new Date().toISOString(),
            }));
            this.logger.log(`Notification "${type}" envoyée au service ${serviceOrigineName} pour patient ${patientId}`);
        }
        catch (err) {
            this.logger.error(`Échec envoi notification "${type}" au service ${serviceOrigineName}: ${err.message}`);
        }
    }
};
exports.NotificationOutgoingService = NotificationOutgoingService;
exports.NotificationOutgoingService = NotificationOutgoingService = NotificationOutgoingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], NotificationOutgoingService);
//# sourceMappingURL=notification-outgoing.service.js.map