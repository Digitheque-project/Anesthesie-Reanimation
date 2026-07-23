"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivitePerOpModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const activite_per_op_entity_1 = require("../entities/activite-per-op.entity");
const constante_per_op_entity_1 = require("../entities/constante-per-op.entity");
const activite_per_op_service_1 = require("./activite-per-op.service");
const activite_per_op_controller_1 = require("./activite-per-op.controller");
const operation_gateway_module_1 = require("../operation-gateway/operation-gateway.module");
let ActivitePerOpModule = class ActivitePerOpModule {
};
exports.ActivitePerOpModule = ActivitePerOpModule;
exports.ActivitePerOpModule = ActivitePerOpModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([activite_per_op_entity_1.ActivitePerOp, constante_per_op_entity_1.ConstantePerOp]), operation_gateway_module_1.OperationGatewayModule],
        controllers: [activite_per_op_controller_1.ActivitePerOpController],
        providers: [activite_per_op_service_1.ActivitePerOpService],
        exports: [activite_per_op_service_1.ActivitePerOpService],
    })
], ActivitePerOpModule);
//# sourceMappingURL=activite-per-op.module.js.map