"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemandeCpaExterneModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const axios_1 = require("@nestjs/axios");
const demande_cpa_externe_entity_1 = require("../entities/demande-cpa-externe.entity");
const creneau_bloc_entity_1 = require("../entities/creneau-bloc.entity");
const cpa_entity_1 = require("../entities/cpa.entity");
const patient_bloc_entity_1 = require("../entities/patient-bloc.entity");
const demande_cpa_externe_service_1 = require("./demande-cpa-externe.service");
const demande_cpa_externe_controller_1 = require("./demande-cpa-externe.controller");
const patient_bloc_module_1 = require("../patient-bloc/patient-bloc.module");
let DemandeCpaExterneModule = class DemandeCpaExterneModule {
};
exports.DemandeCpaExterneModule = DemandeCpaExterneModule;
exports.DemandeCpaExterneModule = DemandeCpaExterneModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                demande_cpa_externe_entity_1.DemandeCpaExterne,
                creneau_bloc_entity_1.CreneauBloc,
                cpa_entity_1.CPA,
                patient_bloc_entity_1.PatientBloc,
            ]),
            axios_1.HttpModule.register({ timeout: 45000 }),
            patient_bloc_module_1.PatientBlocModule,
        ],
        controllers: [demande_cpa_externe_controller_1.DemandeCpaExterneController],
        providers: [demande_cpa_externe_service_1.DemandeCpaExterneService],
        exports: [demande_cpa_externe_service_1.DemandeCpaExterneService],
    })
], DemandeCpaExterneModule);
//# sourceMappingURL=demande-cpa-externe.module.js.map