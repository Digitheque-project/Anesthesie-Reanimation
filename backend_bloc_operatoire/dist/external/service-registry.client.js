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
var ServiceRegistryClient_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRegistryClient = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const service_token_service_1 = require("../central-auth/service-token.service");
let ServiceRegistryClient = ServiceRegistryClient_1 = class ServiceRegistryClient {
    http;
    config;
    serviceToken;
    logger = new common_1.Logger(ServiceRegistryClient_1.name);
    baseUrl;
    cache = new Map();
    cacheDureeMs = 10 * 60 * 1000;
    constructor(http, config, serviceToken) {
        this.http = http;
        this.config = config;
        this.serviceToken = serviceToken;
        this.baseUrl =
            this.config.get('externalServices.serviceRegistryUrl') ?? '';
    }
    authHeaders() {
        return { Authorization: `Bearer ${this.serviceToken.mint()}` };
    }
    async getServiceName(id) {
        if (!this.baseUrl || !id)
            return null;
        const enCache = this.cache.get(id);
        if (enCache && enCache.expireLe > Date.now())
            return enCache.nom;
        try {
            const { data } = await (0, rxjs_1.firstValueFrom)(this.http.get(`${this.baseUrl}/services/${id}`, {
                headers: this.authHeaders(),
            }));
            const nom = data?.name || data?.nom || null;
            if (nom)
                this.cache.set(id, { nom, expireLe: Date.now() + this.cacheDureeMs });
            return nom;
        }
        catch (err) {
            if (err?.response?.status !== 404) {
                this.logger.error(`Erreur résolution nom du service ${id}: ${err?.message ?? err}`);
            }
            return null;
        }
    }
};
exports.ServiceRegistryClient = ServiceRegistryClient;
exports.ServiceRegistryClient = ServiceRegistryClient = ServiceRegistryClient_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService,
        service_token_service_1.ServiceTokenService])
], ServiceRegistryClient);
//# sourceMappingURL=service-registry.client.js.map