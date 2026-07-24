"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MomentsCatalogueModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const moment_catalogue_entry_entity_1 = require("../entities/moment-catalogue-entry.entity");
const moments_catalogue_controller_1 = require("./moments-catalogue.controller");
const moments_catalogue_service_1 = require("./moments-catalogue.service");
let MomentsCatalogueModule = class MomentsCatalogueModule {
};
exports.MomentsCatalogueModule = MomentsCatalogueModule;
exports.MomentsCatalogueModule = MomentsCatalogueModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([moment_catalogue_entry_entity_1.MomentCatalogueEntry])],
        controllers: [moments_catalogue_controller_1.MomentsCatalogueController],
        providers: [moments_catalogue_service_1.MomentsCatalogueService],
    })
], MomentsCatalogueModule);
//# sourceMappingURL=moments-catalogue.module.js.map