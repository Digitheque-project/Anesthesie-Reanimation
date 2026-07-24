"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const patient_bloc_module_1 = require("./patient-bloc/patient-bloc.module");
const medecin_module_1 = require("./medecin/medecin.module");
const cpa_module_1 = require("./cpa/cpa.module");
const verification_veille_module_1 = require("./verification-veille/verification-veille.module");
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
const prescription_imagerie_module_1 = require("./prescription-imagerie/prescription-imagerie.module");
const demande_cpa_externe_module_1 = require("./demande-cpa-externe/demande-cpa-externe.module");
const external_module_1 = require("./external/external.module");
const central_auth_module_1 = require("./central-auth/central-auth.module");
const central_auth_guard_1 = require("./central-auth/central-auth.guard");
const operation_gateway_module_1 = require("./operation-gateway/operation-gateway.module");
const moments_operatoire_module_1 = require("./moments-operatoire/moments-operatoire.module");
const moments_catalogue_module_1 = require("./moments-catalogue/moments-catalogue.module");
const external_services_config_1 = __importDefault(require("./config/external-services.config"));
const central_auth_config_1 = __importDefault(require("./config/central-auth.config"));
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [external_services_config_1.default, central_auth_config_1.default],
            }),
            schedule_1.ScheduleModule.forRoot(),
            external_module_1.ExternalModule,
            central_auth_module_1.CentralAuthModule,
            operation_gateway_module_1.OperationGatewayModule,
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    url: config.get('DATABASE_URL'),
                    ssl: { rejectUnauthorized: false },
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: true,
                }),
            }),
            patient_bloc_module_1.PatientBlocModule,
            medecin_module_1.MedecinModule,
            cpa_module_1.CPAModule,
            verification_veille_module_1.VerificationVeilleModule,
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
            moments_operatoire_module_1.MomentsOperatoireModule,
            moments_catalogue_module_1.MomentsCatalogueModule,
            webhook_notification_module_1.WebhookNotificationModule,
            prescription_module_1.PrescriptionModule,
            prescription_imagerie_module_1.PrescriptionImagerieModule,
            demande_cpa_externe_module_1.DemandeCpaExterneModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, { provide: core_1.APP_GUARD, useClass: central_auth_guard_1.CentralAuthGuard }],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map