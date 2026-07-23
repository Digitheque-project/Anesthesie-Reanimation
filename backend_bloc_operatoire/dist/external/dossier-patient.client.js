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
var DossierPatientClient_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DossierPatientClient = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let DossierPatientClient = DossierPatientClient_1 = class DossierPatientClient {
    http;
    config;
    logger = new common_1.Logger(DossierPatientClient_1.name);
    baseUrl;
    chuId;
    serviceId;
    constructor(http, config) {
        this.http = http;
        this.config = config;
        this.baseUrl = this.config.get('externalServices.dossierPatientApiUrl') ?? '';
        this.chuId = this.config.get('externalServices.chuId') ?? '';
        this.serviceId = this.config.get('externalServices.serviceId') ?? '';
    }
    async get(path, params, token) {
        if (!this.baseUrl) {
            this.logger.warn('DOSSIER_PATIENT_API_URL non configuré, dossier médical externe ignoré');
            return [];
        }
        try {
            const { data } = await (0, rxjs_1.firstValueFrom)(this.http.get(`${this.baseUrl}${path}`, {
                params,
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            }));
            const payload = data && typeof data === 'object' && !Array.isArray(data) && 'data' in data ? data.data : data;
            if (Array.isArray(payload))
                return payload;
            if (payload && typeof payload === 'object')
                return [payload];
            return [];
        }
        catch (err) {
            this.logger.warn(`Échec appel Dossier Patient (${path}): ${err.message}`);
            return [];
        }
    }
    getParPatient(path, patientId, token) {
        return this.get(path, { chuId: this.chuId, serviceId: this.serviceId, patientId }, token);
    }
    getAntecedentsActifs(patientId, token) {
        return this.getParPatient('/dossier-patient/antecedents/active', patientId, token);
    }
    getDiagnostics(patientId, token) {
        return this.getParPatient('/dossier-patient/diagnostics', patientId, token);
    }
    getHistoriqueMaladieRecente(patientId, token) {
        return this.getParPatient('/dossier-patient/medical-histories/latest', patientId, token);
    }
    getHistoriquesUrgents(patientId, token) {
        return this.getParPatient('/dossier-patient/medical-histories/emergency', patientId, token);
    }
    getDernierExamenPhysique(patientId, token) {
        return this.getParPatient('/dossier-patient/physical-examinations/all/latest', patientId, token);
    }
    getExamensComplementairesUrgents(patientId, token) {
        return this.getParPatient('/dossier-patient/complementary-examinations/urgent', patientId, token);
    }
    getSuivis(patientId, token) {
        return this.get(`/dossier-patient/patients/${encodeURIComponent(patientId)}/suivis`, { chuId: this.chuId, serviceId: this.serviceId }, token);
    }
    getObservations(patientId, token) {
        return this.get(`/dossier-patient/observations/patient/${encodeURIComponent(patientId)}`, { chuId: this.chuId, serviceId: this.serviceId }, token);
    }
    getDiagnosticsTous(patientId, token) {
        return this.getParPatient('/dossier-patient/diagnostics', patientId, token);
    }
    getAntecedentsTous(patientId, token) {
        return this.getParPatient('/dossier-patient/antecedents/all', patientId, token);
    }
    getHistoiresMaladie(patientId, token) {
        return this.getParPatient('/dossier-patient/medical-histories', patientId, token);
    }
    getExamensPhysiquesTous(patientId, token) {
        return this.getParPatient('/dossier-patient/physical-examinations/all/latest', patientId, token);
    }
    getExamensComplementairesTous(patientId, token) {
        return this.getParPatient('/dossier-patient/complementary-examinations', patientId, token);
    }
    getSortieMedicale(episodeId, token) {
        if (!this.baseUrl || !episodeId)
            return Promise.resolve([]);
        return this.get(`/dossier-patient/sorties-medicales/episode/${encodeURIComponent(episodeId)}`, {}, token);
    }
};
exports.DossierPatientClient = DossierPatientClient;
exports.DossierPatientClient = DossierPatientClient = DossierPatientClient_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], DossierPatientClient);
//# sourceMappingURL=dossier-patient.client.js.map