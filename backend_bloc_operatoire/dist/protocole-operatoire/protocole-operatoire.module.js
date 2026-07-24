"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtocoleOperatoireModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const protocole_operatoire_entity_1 = require("../entities/protocole-operatoire.entity");
const drainage_entity_1 = require("../entities/drainage.entity");
const protocole_operatoire_service_1 = require("./protocole-operatoire.service");
const protocole_operatoire_controller_1 = require("./protocole-operatoire.controller");
const operation_gateway_module_1 = require("../operation-gateway/operation-gateway.module");
const medecin_module_1 = require("../medecin/medecin.module");
let ProtocoleOperatoireModule = class ProtocoleOperatoireModule {
};
exports.ProtocoleOperatoireModule = ProtocoleOperatoireModule;
exports.ProtocoleOperatoireModule = ProtocoleOperatoireModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([protocole_operatoire_entity_1.ProtocoleOperatoire, drainage_entity_1.Drainage]),
            operation_gateway_module_1.OperationGatewayModule,
            medecin_module_1.MedecinModule,
        ],
        controllers: [protocole_operatoire_controller_1.ProtocoleOperatoireController],
        providers: [protocole_operatoire_service_1.ProtocoleOperatoireService],
        exports: [protocole_operatoire_service_1.ProtocoleOperatoireService],
    })
], ProtocoleOperatoireModule);
//# sourceMappingURL=protocole-operatoire.module.js.map