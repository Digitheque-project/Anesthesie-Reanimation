"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BonCommandeModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bon_commande_anesthesie_entity_1 = require("../entities/bon-commande-anesthesie.entity");
const item_commande_entity_1 = require("../entities/item-commande.entity");
const bon_commande_service_1 = require("./bon-commande.service");
const bon_commande_controller_1 = require("./bon-commande.controller");
const medecin_module_1 = require("../medecin/medecin.module");
let BonCommandeModule = class BonCommandeModule {
};
exports.BonCommandeModule = BonCommandeModule;
exports.BonCommandeModule = BonCommandeModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([bon_commande_anesthesie_entity_1.BonCommandeAnesthesie, item_commande_entity_1.ItemCommande]), medecin_module_1.MedecinModule],
        controllers: [bon_commande_controller_1.BonCommandeController],
        providers: [bon_commande_service_1.BonCommandeService],
        exports: [bon_commande_service_1.BonCommandeService],
    })
], BonCommandeModule);
//# sourceMappingURL=bon-commande.module.js.map