"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const accueil_client_1 = require("./accueil.client");
const service_chu_client_1 = require("./service-chu.client");
const endoscopie_client_1 = require("./endoscopie.client");
let ExternalModule = class ExternalModule {
};
exports.ExternalModule = ExternalModule;
exports.ExternalModule = ExternalModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [axios_1.HttpModule.register({ timeout: 45000 })],
        providers: [accueil_client_1.AccueilClient, service_chu_client_1.ServiceChuClient, endoscopie_client_1.EndoscopieClient],
        exports: [accueil_client_1.AccueilClient, service_chu_client_1.ServiceChuClient, endoscopie_client_1.EndoscopieClient],
    })
], ExternalModule);
//# sourceMappingURL=external.module.js.map