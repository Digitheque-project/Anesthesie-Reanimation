"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientBlocModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const patient_bloc_entity_1 = require("../entities/patient-bloc.entity");
const demande_cpa_externe_entity_1 = require("../entities/demande-cpa-externe.entity");
const patient_bloc_service_1 = require("./patient-bloc.service");
const patient_bloc_controller_1 = require("./patient-bloc.controller");
const patient_bloc_statut_service_1 = require("./patient-bloc-statut.service");
const protocole_operatoire_module_1 = require("../protocole-operatoire/protocole-operatoire.module");
let PatientBlocModule = class PatientBlocModule {
};
exports.PatientBlocModule = PatientBlocModule;
exports.PatientBlocModule = PatientBlocModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([patient_bloc_entity_1.PatientBloc, demande_cpa_externe_entity_1.DemandeCpaExterne]),
            protocole_operatoire_module_1.ProtocoleOperatoireModule,
        ],
        controllers: [patient_bloc_controller_1.PatientBlocController],
        providers: [patient_bloc_service_1.PatientBlocService, patient_bloc_statut_service_1.PatientBlocStatutService],
        exports: [patient_bloc_service_1.PatientBlocService, patient_bloc_statut_service_1.PatientBlocStatutService],
    })
], PatientBlocModule);
//# sourceMappingURL=patient-bloc.module.js.map