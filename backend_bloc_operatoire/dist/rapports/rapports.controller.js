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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RapportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rapports_service_1 = require("./rapports.service");
let RapportsController = class RapportsController {
    rapportsService;
    constructor(rapportsService) {
        this.rapportsService = rapportsService;
    }
    tableauDeBord(dd, df) {
        return this.rapportsService.tableauDeBord(dd, df);
    }
    statistiques(dd, df) {
        return this.rapportsService.statistiquesGenerales(dd, df);
    }
    activiteChirurgiens(dd, df) {
        return this.rapportsService.activiteParChirurgien(dd, df);
    }
    cpaEnAttente() {
        return this.rapportsService.cpaEnAttente();
    }
    tauxOccupation() {
        return this.rapportsService.tauxOccupation();
    }
    exportStats() {
        return this.rapportsService.exportStatistiques('excel');
    }
};
exports.RapportsController = RapportsController;
__decorate([
    (0, common_1.Get)('tableau-de-bord'),
    (0, swagger_1.ApiOperation)({
        summary: 'Tableau de bord complet (statistiques, activité par personnel, détail des opérations)',
    }),
    __param(0, (0, common_1.Query)('dateDebut')),
    __param(1, (0, common_1.Query)('dateFin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RapportsController.prototype, "tableauDeBord", null);
__decorate([
    (0, common_1.Get)('statistiques'),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques globales' }),
    __param(0, (0, common_1.Query)('dateDebut')),
    __param(1, (0, common_1.Query)('dateFin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RapportsController.prototype, "statistiques", null);
__decorate([
    (0, common_1.Get)('activite-chirurgiens'),
    (0, swagger_1.ApiOperation)({ summary: 'Activité par chirurgien' }),
    __param(0, (0, common_1.Query)('dateDebut')),
    __param(1, (0, common_1.Query)('dateFin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RapportsController.prototype, "activiteChirurgiens", null);
__decorate([
    (0, common_1.Get)('cpa-en-attente'),
    (0, swagger_1.ApiOperation)({ summary: 'CPA en attente' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RapportsController.prototype, "cpaEnAttente", null);
__decorate([
    (0, common_1.Get)('taux-occupation'),
    (0, swagger_1.ApiOperation)({ summary: "Taux d'occupation" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RapportsController.prototype, "tauxOccupation", null);
__decorate([
    (0, common_1.Get)('export'),
    (0, swagger_1.ApiOperation)({ summary: 'Export statistiques' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RapportsController.prototype, "exportStats", null);
exports.RapportsController = RapportsController = __decorate([
    (0, swagger_1.ApiTags)('Rapports'),
    (0, common_1.Controller)('rapports'),
    __metadata("design:paramtypes", [rapports_service_1.RapportsService])
], RapportsController);
//# sourceMappingURL=rapports.controller.js.map