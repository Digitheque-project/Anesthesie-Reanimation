"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChecklistApresOpModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const checklist_apres_op_entity_1 = require("../entities/checklist-apres-op.entity");
const checklist_apres_op_controller_1 = require("./checklist-apres-op.controller");
const checklist_apres_op_service_1 = require("./checklist-apres-op.service");
const operation_gateway_module_1 = require("../operation-gateway/operation-gateway.module");
const patient_bloc_module_1 = require("../patient-bloc/patient-bloc.module");
let ChecklistApresOpModule = class ChecklistApresOpModule {
};
exports.ChecklistApresOpModule = ChecklistApresOpModule;
exports.ChecklistApresOpModule = ChecklistApresOpModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([checklist_apres_op_entity_1.ChecklistApresOp]),
            operation_gateway_module_1.OperationGatewayModule,
            patient_bloc_module_1.PatientBlocModule,
        ],
        controllers: [checklist_apres_op_controller_1.ChecklistApresOpController],
        providers: [checklist_apres_op_service_1.ChecklistApresOpService],
    })
], ChecklistApresOpModule);
//# sourceMappingURL=checklist-apres-op.module.js.map