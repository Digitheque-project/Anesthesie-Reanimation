"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationVeilleModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const verification_veille_entity_1 = require("../entities/verification-veille.entity");
const cpa_entity_1 = require("../entities/cpa.entity");
const patient_bloc_entity_1 = require("../entities/patient-bloc.entity");
const demande_cpa_externe_module_1 = require("../demande-cpa-externe/demande-cpa-externe.module");
const patient_bloc_module_1 = require("../patient-bloc/patient-bloc.module");
const medecin_module_1 = require("../medecin/medecin.module");
const verification_veille_service_1 = require("./verification-veille.service");
const verification_veille_controller_1 = require("./verification-veille.controller");
let VerificationVeilleModule = class VerificationVeilleModule {
};
exports.VerificationVeilleModule = VerificationVeilleModule;
exports.VerificationVeilleModule = VerificationVeilleModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([verification_veille_entity_1.VerificationVeille, cpa_entity_1.CPA, patient_bloc_entity_1.PatientBloc]), demande_cpa_externe_module_1.DemandeCpaExterneModule, patient_bloc_module_1.PatientBlocModule, medecin_module_1.MedecinModule],
        controllers: [verification_veille_controller_1.VerificationVeilleController],
        providers: [verification_veille_service_1.VerificationVeilleService],
        exports: [verification_veille_service_1.VerificationVeilleService],
    })
], VerificationVeilleModule);
//# sourceMappingURL=verification-veille.module.js.map