"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VPAModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const vpa_entity_1 = require("../entities/vpa.entity");
const patient_bloc_entity_1 = require("../entities/patient-bloc.entity");
const demande_cpa_externe_module_1 = require("../demande-cpa-externe/demande-cpa-externe.module");
const vpa_service_1 = require("./vpa.service");
const vpa_controller_1 = require("./vpa.controller");
let VPAModule = class VPAModule {
};
exports.VPAModule = VPAModule;
exports.VPAModule = VPAModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([vpa_entity_1.VPA, patient_bloc_entity_1.PatientBloc]), demande_cpa_externe_module_1.DemandeCpaExterneModule],
        controllers: [vpa_controller_1.VPAController],
        providers: [vpa_service_1.VPAService],
        exports: [vpa_service_1.VPAService],
    })
], VPAModule);
//# sourceMappingURL=vpa.module.js.map