"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MomentsOperatoireModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const moment_operatoire_entity_1 = require("../entities/moment-operatoire.entity");
const moments_operatoire_controller_1 = require("./moments-operatoire.controller");
const moments_operatoire_service_1 = require("./moments-operatoire.service");
const operation_gateway_module_1 = require("../operation-gateway/operation-gateway.module");
let MomentsOperatoireModule = class MomentsOperatoireModule {
};
exports.MomentsOperatoireModule = MomentsOperatoireModule;
exports.MomentsOperatoireModule = MomentsOperatoireModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([moment_operatoire_entity_1.MomentOperatoire]),
            operation_gateway_module_1.OperationGatewayModule,
        ],
        controllers: [moments_operatoire_controller_1.MomentsOperatoireController],
        providers: [moments_operatoire_service_1.MomentsOperatoireService],
    })
], MomentsOperatoireModule);
//# sourceMappingURL=moments-operatoire.module.js.map