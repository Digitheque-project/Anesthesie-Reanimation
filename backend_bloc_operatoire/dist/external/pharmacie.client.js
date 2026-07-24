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
var PharmacieClient_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PharmacieClient = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const DUREE_CACHE_MS = 5 * 60 * 1000;
let PharmacieClient = PharmacieClient_1 = class PharmacieClient {
    http;
    config;
    logger = new common_1.Logger(PharmacieClient_1.name);
    baseUrl;
    cache = null;
    constructor(http, config) {
        this.http = http;
        this.config = config;
        this.baseUrl = this.config.get('externalServices.pharmacieApiUrl') ?? '';
    }
    async getStockSalePrices() {
        if (!this.baseUrl) {
            this.logger.warn('PHARMACIE_API_URL non configuré');
            return [];
        }
        if (this.cache && this.cache.expiresAt > Date.now()) {
            return this.cache.data;
        }
        try {
            const { data } = await (0, rxjs_1.firstValueFrom)(this.http.get(`${this.baseUrl}/articles/stock-sale-prices`));
            const articles = Array.isArray(data) ? data : [];
            this.cache = { expiresAt: Date.now() + DUREE_CACHE_MS, data: articles };
            return articles;
        }
        catch (err) {
            this.logger.error(`Erreur récupération catalogue prix Pharmacie: ${err.message}`);
            return this.cache?.data ?? [];
        }
    }
};
exports.PharmacieClient = PharmacieClient;
exports.PharmacieClient = PharmacieClient = PharmacieClient_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], PharmacieClient);
//# sourceMappingURL=pharmacie.client.js.map