"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArchivesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const patient_bloc_entity_1 = require("../entities/patient-bloc.entity");
const cpa_entity_1 = require("../entities/cpa.entity");
const verification_veille_entity_1 = require("../entities/verification-veille.entity");
const bon_commande_anesthesie_entity_1 = require("../entities/bon-commande-anesthesie.entity");
const activite_per_op_entity_1 = require("../entities/activite-per-op.entity");
const protocole_operatoire_entity_1 = require("../entities/protocole-operatoire.entity");
const score_sccre_entity_1 = require("../entities/score-sccre.entity");
const sortie_reveil_entity_1 = require("../entities/sortie-reveil.entity");
const checklist_avant_op_entity_1 = require("../entities/checklist-avant-op.entity");
const checklist_pendant_op_entity_1 = require("../entities/checklist-pendant-op.entity");
const checklist_apres_op_entity_1 = require("../entities/checklist-apres-op.entity");
const notification_cpa_entity_1 = require("../entities/notification-cpa.entity");
const demande_cpa_externe_entity_1 = require("../entities/demande-cpa-externe.entity");
const moment_operatoire_entity_1 = require("../entities/moment-operatoire.entity");
const archives_service_1 = require("./archives.service");
const archives_controller_1 = require("./archives.controller");
let ArchivesModule = class ArchivesModule {
};
exports.ArchivesModule = ArchivesModule;
exports.ArchivesModule = ArchivesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                patient_bloc_entity_1.PatientBloc, cpa_entity_1.CPA, verification_veille_entity_1.VerificationVeille, bon_commande_anesthesie_entity_1.BonCommandeAnesthesie,
                activite_per_op_entity_1.ActivitePerOp, protocole_operatoire_entity_1.ProtocoleOperatoire,
                score_sccre_entity_1.ScoreSCCRE, sortie_reveil_entity_1.SortieReveil,
                checklist_avant_op_entity_1.ChecklistAvantOp, checklist_pendant_op_entity_1.ChecklistPendantOp, checklist_apres_op_entity_1.ChecklistApresOp,
                notification_cpa_entity_1.NotificationCPA, demande_cpa_externe_entity_1.DemandeCpaExterne, moment_operatoire_entity_1.MomentOperatoire,
            ]),
        ],
        controllers: [archives_controller_1.ArchivesController],
        providers: [archives_service_1.ArchivesService],
        exports: [archives_service_1.ArchivesService],
    })
], ArchivesModule);
//# sourceMappingURL=archives.module.js.map