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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedecinIdentiteService = void 0;
const common_1 = require("@nestjs/common");
const medecin_service_1 = require("./medecin.service");
const central_user_client_1 = require("../external/central-user.client");
let MedecinIdentiteService = class MedecinIdentiteService {
    medecinService;
    centralUserClient;
    constructor(medecinService, centralUserClient) {
        this.medecinService = medecinService;
        this.centralUserClient = centralUserClient;
    }
    async resoudreLot(ids) {
        const uniques = Array.from(new Set(ids.filter(Boolean)));
        if (!uniques.length)
            return {};
        const central = await this.centralUserClient.getUsers(uniques);
        const manquants = uniques.filter((id) => !central[id]);
        const locaux = {};
        await Promise.all(manquants.map(async (id) => {
            try {
                locaux[id] = await this.medecinService.findOne(id);
            }
            catch {
            }
        }));
        const resultat = {};
        for (const id of uniques) {
            const identite = central[id] || locaux[id];
            if (identite)
                resultat[id] = identite;
        }
        return resultat;
    }
    async enrichir(records, idField, outputKey) {
        const identites = await this.resoudreLot(records.map((r) => r?.[idField]));
        return records.map((r) => {
            const id = r?.[idField];
            return { ...r, [outputKey]: id ? identites[id] || null : null };
        });
    }
    async enrichirPlusieurs(records, paires) {
        let resultat = records;
        for (const [idField, outputKey] of paires) {
            resultat = await this.enrichir(resultat, idField, outputKey);
        }
        return resultat;
    }
};
exports.MedecinIdentiteService = MedecinIdentiteService;
exports.MedecinIdentiteService = MedecinIdentiteService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [medecin_service_1.MedecinService,
        central_user_client_1.CentralUserClient])
], MedecinIdentiteService);
//# sourceMappingURL=medecin-identite.service.js.map