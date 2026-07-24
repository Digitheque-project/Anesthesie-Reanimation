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
exports.PharmacieController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const pharmacie_client_1 = require("../external/pharmacie.client");
let PharmacieController = class PharmacieController {
    pharmacieClient;
    constructor(pharmacieClient) {
        this.pharmacieClient = pharmacieClient;
    }
    getPrix() {
        return this.pharmacieClient.getStockSalePrices();
    }
};
exports.PharmacieController = PharmacieController;
__decorate([
    (0, common_1.Get)('prix'),
    (0, swagger_1.ApiOperation)({
        summary: "Catalogue des prix Pharmacie (proxy, mis en cache) — pour le rapprochement des médicaments d'anesthésie/réanimation",
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PharmacieController.prototype, "getPrix", null);
exports.PharmacieController = PharmacieController = __decorate([
    (0, swagger_1.ApiTags)('Pharmacie'),
    (0, common_1.Controller)('pharmacie'),
    __metadata("design:paramtypes", [pharmacie_client_1.PharmacieClient])
], PharmacieController);
//# sourceMappingURL=pharmacie.controller.js.map