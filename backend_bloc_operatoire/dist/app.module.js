"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const patient_module_1 = require("./patient/patient.module");
const medecin_module_1 = require("./medecin/medecin.module");
const cpa_module_1 = require("./cpa/cpa.module");
const vpa_module_1 = require("./vpa/vpa.module");
const bon_commande_module_1 = require("./bon-commande/bon-commande.module");
const activite_per_op_module_1 = require("./activite-per-op/activite-per-op.module");
const protocole_operatoire_module_1 = require("./protocole-operatoire/protocole-operatoire.module");
const score_sccre_module_1 = require("./score-sccre/score-sccre.module");
const sortie_reveil_module_1 = require("./sortie-reveil/sortie-reveil.module");
const notification_cpa_module_1 = require("./notification-cpa/notification-cpa.module");
const auth_module_1 = require("./auth/auth.module");
const archives_module_1 = require("./archives/archives.module");
const rapports_module_1 = require("./rapports/rapports.module");
const planning_module_1 = require("./planning/planning.module");
const tracabilite_module_1 = require("./tracabilite/tracabilite.module");
const exports_module_1 = require("./exports/exports.module");
const checklist_avant_op_module_1 = require("./checklist-avant-op/checklist-avant-op.module");
const checklist_pendant_op_module_1 = require("./checklist-pendant-op/checklist-pendant-op.module");
const checklist_apres_op_module_1 = require("./checklist-apres-op/checklist-apres-op.module");
const webhook_notification_module_1 = require("./webhook-notification/webhook-notification.module");
const prescription_module_1 = require("./prescription/prescription.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    url: config.get('DATABASE_URL'),
                    ssl: { rejectUnauthorized: false },
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: false,
                }),
            }),
            patient_module_1.PatientModule,
            medecin_module_1.MedecinModule,
            cpa_module_1.CPAModule,
            vpa_module_1.VPAModule,
            bon_commande_module_1.BonCommandeModule,
            activite_per_op_module_1.ActivitePerOpModule,
            protocole_operatoire_module_1.ProtocoleOperatoireModule,
            score_sccre_module_1.ScoreSCCREModule,
            sortie_reveil_module_1.SortieReveilModule,
            notification_cpa_module_1.NotificationCPAModule,
            auth_module_1.AuthModule,
            archives_module_1.ArchivesModule,
            rapports_module_1.RapportsModule,
            planning_module_1.PlanningModule,
            tracabilite_module_1.TracabiliteModule,
            exports_module_1.ExportsModule,
            checklist_avant_op_module_1.ChecklistAvantOpModule,
            checklist_pendant_op_module_1.ChecklistPendantOpModule,
            checklist_apres_op_module_1.ChecklistApresOpModule,
            webhook_notification_module_1.WebhookNotificationModule,
            prescription_module_1.PrescriptionModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map