"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccueilClient = void 0;
const axios_1 = __importDefault(require("axios"));
function isAxiosError(error) {
    return error && error.isAxiosError === true;
}
class AccueilClient {
    baseUrl;
    constructor(baseUrl = 'https://api.example.com') {
        this.baseUrl = baseUrl;
    }
    async getAccueilData() {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/accueil`);
            return response.data;
        }
        catch (err) {
            if (isAxiosError(err) && err.response?.status === 404) {
                return null;
            }
            console.error('Erreur getAccueilData:', err);
            throw err;
        }
    }
    async getPatientData(patientId) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/patients/${patientId}`);
            return response.data;
        }
        catch (err) {
            if (isAxiosError(err) && err.response?.status === 404) {
                return null;
            }
            console.error('Erreur getPatientData:', err);
            throw err;
        }
    }
    async getPatient(patientId) {
        return this.getPatientData(patientId);
    }
    async searchPatients(q) {
        const endpoint = `/patients?search=${encodeURIComponent(q)}`;
        return this.get(endpoint);
    }
    async registerPatient(identite, createdBy) {
        const payload = { ...identite };
        if (createdBy)
            payload.createdBy = createdBy;
        return this.post('/patients', payload);
    }
    async enrichWithIdentity(data) {
        const isArray = Array.isArray(data);
        const records = isArray ? data : [data];
        const ids = Array.from(new Set(records.map((r) => r?.patientId).filter(Boolean)));
        const identities = {};
        await Promise.all(ids.map(async (id) => {
            try {
                const p = await this.getPatient(id);
                if (p)
                    identities[id] = p;
            }
            catch (e) {
                console.error(`Failed to fetch identity for ${id}:`, e?.message ?? e);
            }
        }));
        const enriched = records.map((r) => {
            const id = r?.patientId;
            const identity = id ? identities[id] || null : null;
            return { ...r, ...(identity || {}) };
        });
        return isArray ? enriched : enriched[0];
    }
    async get(endpoint) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}${endpoint}`);
            return response.data;
        }
        catch (err) {
            if (isAxiosError(err) && err.response?.status === 404) {
                return null;
            }
            console.error(`Erreur GET ${endpoint}:`, err);
            throw err;
        }
    }
    async post(endpoint, data) {
        try {
            const response = await axios_1.default.post(`${this.baseUrl}${endpoint}`, data);
            return response.data;
        }
        catch (err) {
            console.error(`Erreur POST ${endpoint}:`, err);
            throw err;
        }
    }
}
exports.AccueilClient = AccueilClient;
exports.default = AccueilClient;
//# sourceMappingURL=accueil.client.js.map