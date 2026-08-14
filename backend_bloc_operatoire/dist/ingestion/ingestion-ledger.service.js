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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var IngestionLedgerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestionLedgerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ingestion_externe_entity_1 = require("../entities/ingestion-externe.entity");
let IngestionLedgerService = IngestionLedgerService_1 = class IngestionLedgerService {
    repo;
    logger = new common_1.Logger(IngestionLedgerService_1.name);
    constructor(repo) {
        this.repo = repo;
    }
    async dejaIngeree(canal, referenceExterne) {
        if (!referenceExterne)
            return false;
        const compte = await this.repo.count({
            where: { canal, referenceExterne: String(referenceExterne) },
        });
        return compte > 0;
    }
    async marquerIngeree(params) {
        const { canal, referenceExterne, patientId, serviceSourceId, libelle } = params;
        if (!referenceExterne)
            return;
        try {
            await this.repo.insert({
                canal,
                referenceExterne: String(referenceExterne),
                patientId,
                serviceSourceId: serviceSourceId ?? null,
                libelle: libelle ? libelle.slice(0, 255) : null,
            });
        }
        catch (err) {
            this.logger.warn(`Journal d'ingestion : ${canal}/${referenceExterne} déjà enregistré (${err.message})`);
        }
    }
};
exports.IngestionLedgerService = IngestionLedgerService;
exports.IngestionLedgerService = IngestionLedgerService = IngestionLedgerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ingestion_externe_entity_1.IngestionExterne)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], IngestionLedgerService);
//# sourceMappingURL=ingestion-ledger.service.js.map