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
var ServiceChuClient_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceChuClient = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let ServiceChuClient = ServiceChuClient_1 = class ServiceChuClient {
    http;
    config;
    logger = new common_1.Logger(ServiceChuClient_1.name);
    baseUrl;
    chuId;
    serviceId;
    constructor(http, config) {
        this.http = http;
        this.config = config;
        this.baseUrl =
            this.config.get('externalServices.serviceChuApiUrl') ?? '';
        this.chuId = this.config.get('externalServices.chuId') ?? '';
        this.serviceId =
            this.config.get('externalServices.serviceId') ?? '';
    }
    async getChu(id) {
        const { data } = await (0, rxjs_1.firstValueFrom)(this.http.get(`${this.baseUrl}/chu/${id ?? this.chuId}`));
        return data;
    }
    async getService(id) {
        const { data } = await (0, rxjs_1.firstValueFrom)(this.http.get(`${this.baseUrl}/service/chu/${this.chuId}/service/${id ?? this.serviceId}`));
        return data;
    }
};
exports.ServiceChuClient = ServiceChuClient;
exports.ServiceChuClient = ServiceChuClient = ServiceChuClient_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], ServiceChuClient);
//# sourceMappingURL=service-chu.client.js.map