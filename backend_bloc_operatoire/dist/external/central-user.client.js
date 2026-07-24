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
var CentralUserClient_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CentralUserClient = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const service_token_service_1 = require("../central-auth/service-token.service");
let CentralUserClient = CentralUserClient_1 = class CentralUserClient {
    http;
    config;
    serviceToken;
    logger = new common_1.Logger(CentralUserClient_1.name);
    baseUrl;
    constructor(http, config, serviceToken) {
        this.http = http;
        this.config = config;
        this.serviceToken = serviceToken;
        this.baseUrl =
            this.config.get('externalServices.centralUserServiceUrl') ?? '';
    }
    authHeaders() {
        return { Authorization: `Bearer ${this.serviceToken.mint()}` };
    }
    normaliser(u) {
        return {
            id: u.id ?? u.userId,
            nom: u.name,
            prenom: u.firstname,
            email: u.email,
            telephone: u.phone ?? null,
            matricule: u.matricule ?? null,
            numeroOrdre: u.registration_number_professional_order ?? null,
            ordre: u.professional_order ?? null,
        };
    }
    async getUser(id) {
        if (!this.baseUrl || !id)
            return null;
        try {
            const { data } = await (0, rxjs_1.firstValueFrom)(this.http.get(`${this.baseUrl}/users/${id}`, {
                headers: this.authHeaders(),
            }));
            return data ? this.normaliser(data) : null;
        }
        catch (err) {
            if (err?.response?.status === 404)
                return null;
            this.logger.error(`Erreur récupération utilisateur central ${id}: ${err?.message ?? err}`);
            return null;
        }
    }
    async getUsers(ids) {
        const uniques = Array.from(new Set(ids.filter(Boolean)));
        const identites = {};
        await Promise.all(uniques.map(async (id) => {
            const u = await this.getUser(id);
            if (u)
                identites[id] = u;
        }));
        return identites;
    }
};
exports.CentralUserClient = CentralUserClient;
exports.CentralUserClient = CentralUserClient = CentralUserClient_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService,
        service_token_service_1.ServiceTokenService])
], CentralUserClient);
//# sourceMappingURL=central-user.client.js.map