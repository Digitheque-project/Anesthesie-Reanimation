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
var EndoscopieClient_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndoscopieClient = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let EndoscopieClient = EndoscopieClient_1 = class EndoscopieClient {
    http;
    config;
    logger = new common_1.Logger(EndoscopieClient_1.name);
    baseUrl;
    serviceId;
    blocServiceId;
    constructor(http, config) {
        this.http = http;
        this.config = config;
        this.baseUrl =
            this.config.get('externalServices.endoscopieApiUrl') ?? '';
        this.serviceId =
            this.config.get('externalServices.endoscopieServiceId') ?? '';
        this.blocServiceId =
            this.config.get('externalServices.serviceId') ?? '';
    }
    async notify(demande, type, payload) {
        if (!this.baseUrl) {
            this.logger.warn('ENDOSCOPIE_API_URL non configuré, notification sortante ignorée');
            return;
        }
        try {
            await (0, rxjs_1.firstValueFrom)(this.http.post(`${this.baseUrl}/notifications/receive`, {
                type,
                motif: `Résultat demande CPA/VPA pour patient ${demande.patientId}`,
                patientId: demande.patientId,
                entiteRefType: demande.sourceReferenceType,
                entiteRefId: demande.sourceReferenceId,
                emitter: this.blocServiceId,
                emitterName: 'Bloc Opératoire',
                recipient: demande.sourceServiceId || this.serviceId,
                recipientName: demande.sourceServiceName || 'Endoscopie',
                payload,
                createdAt: new Date().toISOString(),
            }));
            this.logger.log(`✅ Notification "${type}" envoyée à Endoscopie pour patient ${demande.patientId}`);
        }
        catch (err) {
            this.logger.error(`❌ Échec envoi notification "${type}" à Endoscopie: ${err.message}`);
        }
    }
    async notifyCpaResultat(demande, decision, details) {
        await this.notify(demande, 'CPA_RESULTAT', { decision, ...details });
    }
    async notifyVpaRealisee(demande, details) {
        await this.notify(demande, 'VPA_REALISEE', details);
    }
};
exports.EndoscopieClient = EndoscopieClient;
exports.EndoscopieClient = EndoscopieClient = EndoscopieClient_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], EndoscopieClient);
//# sourceMappingURL=endoscopie.client.js.map