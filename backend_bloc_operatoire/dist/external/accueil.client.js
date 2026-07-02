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
var AccueilClient_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccueilClient = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let AccueilClient = AccueilClient_1 = class AccueilClient {
    http;
    config;
    logger = new common_1.Logger(AccueilClient_1.name);
    baseUrl;
    chuId;
    constructor(http, config) {
        this.http = http;
        this.config = config;
        this.baseUrl = this.config.get('externalServices.accueilApiUrl') ?? '';
        this.chuId = this.config.get('externalServices.chuId') ?? '';
    }
    async listPatients(chuId) {
        const { data } = await (0, rxjs_1.firstValueFrom)(this.http.get(`${this.baseUrl}/patients`, {
            params: { chuId: chuId ?? this.chuId },
        }));
        return data ?? [];
    }
    async getPatient(id, chuId) {
        try {
            const { data } = await (0, rxjs_1.firstValueFrom)(this.http.get(`${this.baseUrl}/patients/${id}`, {
                params: { chuId: chuId ?? this.chuId },
            }));
            return data ?? null;
        }
        catch (err) {
            if (err.response?.status === 404)
                return null;
            this.logger.error(`Erreur getPatient(${id}): ${err.message}`);
            throw err;
        }
    }
    async registerPatient(dto, createdBy) {
        const { data } = await (0, rxjs_1.firstValueFrom)(this.http.post(`${this.baseUrl}/patients/register`, {
            ...dto,
            chuId: this.chuId,
            createdBy,
        }));
        return data;
    }
    async searchPatients(query, chuId) {
        const all = await this.listPatients(chuId);
        if (!query)
            return all;
        const q = query.toLowerCase();
        return all.filter((p) => p.nom?.toLowerCase().includes(q) ||
            p.prenom?.toLowerCase().includes(q) ||
            p.cin?.toLowerCase().includes(q) ||
            p.id?.toLowerCase().includes(q));
    }
    async enrichWithIdentity(records, chuId) {
        if (records.length === 0)
            return [];
        let patients = [];
        try {
            patients = await this.listPatients(chuId);
        }
        catch (err) {
            this.logger.error(`enrichWithIdentity: échec listPatients: ${err.message}`);
        }
        const byId = new Map(patients.map((p) => [p.id, p]));
        return records.map((record) => ({ ...record, patient: byId.get(record.patientId) ?? null }));
    }
};
exports.AccueilClient = AccueilClient;
exports.AccueilClient = AccueilClient = AccueilClient_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], AccueilClient);
//# sourceMappingURL=accueil.client.js.map