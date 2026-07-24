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
var PrescriptionImagerieClient_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionImagerieClient = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let PrescriptionImagerieClient = PrescriptionImagerieClient_1 = class PrescriptionImagerieClient {
    http;
    config;
    logger = new common_1.Logger(PrescriptionImagerieClient_1.name);
    baseUrl;
    constructor(http, config) {
        this.http = http;
        this.config = config;
        this.baseUrl =
            this.config.get('externalServices.prescriptionImagerieApiUrl') ??
                '';
    }
    async getParPatient(patientId) {
        if (!this.baseUrl) {
            this.logger.warn('PRESCRIPTION_IMAGERIE_API_URL non configuré');
            return [];
        }
        try {
            const { data } = await (0, rxjs_1.firstValueFrom)(this.http.get(`${this.baseUrl}/api/prescriptions/imagerie/patient/${encodeURIComponent(patientId)}`));
            return Array.isArray(data?.data) ? data.data : [];
        }
        catch (err) {
            this.logger.error(`Erreur récupération prescriptions imagerie du patient ${patientId}: ${err.message}`);
            return [];
        }
    }
    async getParId(id) {
        if (!this.baseUrl) {
            this.logger.warn('PRESCRIPTION_IMAGERIE_API_URL non configuré');
            return null;
        }
        try {
            const { data } = await (0, rxjs_1.firstValueFrom)(this.http.get(`${this.baseUrl}/api/prescriptions/imagerie/${encodeURIComponent(id)}`));
            return data?.data ?? null;
        }
        catch (err) {
            this.logger.error(`Erreur récupération prescription imagerie ${id}: ${err.message}`);
            return null;
        }
    }
};
exports.PrescriptionImagerieClient = PrescriptionImagerieClient;
exports.PrescriptionImagerieClient = PrescriptionImagerieClient = PrescriptionImagerieClient_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], PrescriptionImagerieClient);
//# sourceMappingURL=prescription-imagerie.client.js.map