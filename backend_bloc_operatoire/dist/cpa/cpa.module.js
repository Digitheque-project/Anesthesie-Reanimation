"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CPAModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cpa_entity_1 = require("../entities/cpa.entity");
const patient_bloc_entity_1 = require("../entities/patient-bloc.entity");
const premedicament_entity_1 = require("../entities/premedicament.entity");
const demande_cpa_externe_module_1 = require("../demande-cpa-externe/demande-cpa-externe.module");
const medecin_module_1 = require("../medecin/medecin.module");
const cpa_service_1 = require("./cpa.service");
const cpa_controller_1 = require("./cpa.controller");
let CPAModule = class CPAModule {
};
exports.CPAModule = CPAModule;
exports.CPAModule = CPAModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([cpa_entity_1.CPA, patient_bloc_entity_1.PatientBloc, premedicament_entity_1.Premedicament]), demande_cpa_externe_module_1.DemandeCpaExterneModule, medecin_module_1.MedecinModule],
        controllers: [cpa_controller_1.CPAController],
        providers: [cpa_service_1.CPAService],
        exports: [cpa_service_1.CPAService],
    })
], CPAModule);
//# sourceMappingURL=cpa.module.js.map