"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RapportsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const patient_bloc_entity_1 = require("../entities/patient-bloc.entity");
const activite_per_op_entity_1 = require("../entities/activite-per-op.entity");
const score_sccre_entity_1 = require("../entities/score-sccre.entity");
const medecin_entity_1 = require("../entities/medecin.entity");
const cpa_entity_1 = require("../entities/cpa.entity");
const notification_cpa_entity_1 = require("../entities/notification-cpa.entity");
const rapports_service_1 = require("./rapports.service");
const rapports_controller_1 = require("./rapports.controller");
let RapportsModule = class RapportsModule {
};
exports.RapportsModule = RapportsModule;
exports.RapportsModule = RapportsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([patient_bloc_entity_1.PatientBloc, activite_per_op_entity_1.ActivitePerOp, score_sccre_entity_1.ScoreSCCRE, medecin_entity_1.Medecin, cpa_entity_1.CPA, notification_cpa_entity_1.NotificationCPA])],
        controllers: [rapports_controller_1.RapportsController],
        providers: [rapports_service_1.RapportsService],
        exports: [rapports_service_1.RapportsService],
    })
], RapportsModule);
//# sourceMappingURL=rapports.module.js.map