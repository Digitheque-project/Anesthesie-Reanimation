"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChecklistPendantOpModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const checklist_pendant_op_entity_1 = require("../entities/checklist-pendant-op.entity");
const checklist_pendant_op_controller_1 = require("./checklist-pendant-op.controller");
const checklist_pendant_op_service_1 = require("./checklist-pendant-op.service");
const operation_gateway_module_1 = require("../operation-gateway/operation-gateway.module");
const patient_bloc_module_1 = require("../patient-bloc/patient-bloc.module");
let ChecklistPendantOpModule = class ChecklistPendantOpModule {
};
exports.ChecklistPendantOpModule = ChecklistPendantOpModule;
exports.ChecklistPendantOpModule = ChecklistPendantOpModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([checklist_pendant_op_entity_1.ChecklistPendantOp]), operation_gateway_module_1.OperationGatewayModule, patient_bloc_module_1.PatientBlocModule],
        controllers: [checklist_pendant_op_controller_1.ChecklistPendantOpController],
        providers: [checklist_pendant_op_service_1.ChecklistPendantOpService],
    })
], ChecklistPendantOpModule);
//# sourceMappingURL=checklist-pendant-op.module.js.map