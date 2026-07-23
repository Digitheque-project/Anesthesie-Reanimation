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
var PrescriptionExterneClient_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionExterneClient = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const service_token_service_1 = require("../central-auth/service-token.service");
let PrescriptionExterneClient = PrescriptionExterneClient_1 = class PrescriptionExterneClient {
    http;
    config;
    serviceToken;
    logger = new common_1.Logger(PrescriptionExterneClient_1.name);
    baseUrl;
    constructor(http, config, serviceToken) {
        this.http = http;
        this.config = config;
        this.serviceToken = serviceToken;
        this.baseUrl = this.config.get('externalServices.prescriptionApiUrl') ?? '';
    }
    authHeaders() {
        return { Authorization: `Bearer ${this.serviceToken.mint()}` };
    }
    async getPrescriptionsBloc(serviceIdDest) {
        if (!this.baseUrl) {
            this.logger.warn('PRESCRIPTION_API_URL non configuré');
            return [];
        }
        try {
            const { data } = await (0, rxjs_1.firstValueFrom)(this.http.get(`${this.baseUrl}/prescriptions/bloc`, {
                params: { serviceIdDest },
                headers: this.authHeaders(),
            }));
            return Array.isArray(data) ? data : [];
        }
        catch (err) {
            this.logger.error(`Erreur récupération prescriptions bloc: ${err.message}`);
            return [];
        }
    }
    async updateStatut(id, statut) {
        if (!this.baseUrl)
            return;
        try {
            await (0, rxjs_1.firstValueFrom)(this.http.put(`${this.baseUrl}/prescriptions/bloc/${id}/statut`, { statut }, { headers: this.authHeaders() }));
        }
        catch (err) {
            this.logger.error(`Erreur mise à jour statut prescription ${id}: ${err.message}`);
        }
    }
};
exports.PrescriptionExterneClient = PrescriptionExterneClient;
exports.PrescriptionExterneClient = PrescriptionExterneClient = PrescriptionExterneClient_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService,
        service_token_service_1.ServiceTokenService])
], PrescriptionExterneClient);
//# sourceMappingURL=prescription-externe.client.js.map