"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationCPAModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const notification_cpa_entity_1 = require("../entities/notification-cpa.entity");
const webhook_notification_entity_1 = require("../entities/webhook-notification.entity");
const patient_bloc_entity_1 = require("../entities/patient-bloc.entity");
const creneau_bloc_entity_1 = require("../entities/creneau-bloc.entity");
const notification_cpa_service_1 = require("./notification-cpa.service");
const notification_cpa_controller_1 = require("./notification-cpa.controller");
const notification_alerte_service_1 = require("./notification-alerte.service");
const notification_alerte_controller_1 = require("./notification-alerte.controller");
const medecin_module_1 = require("../medecin/medecin.module");
let NotificationCPAModule = class NotificationCPAModule {
};
exports.NotificationCPAModule = NotificationCPAModule;
exports.NotificationCPAModule = NotificationCPAModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                notification_cpa_entity_1.NotificationCPA,
                webhook_notification_entity_1.WebhookNotification,
                patient_bloc_entity_1.PatientBloc,
                creneau_bloc_entity_1.CreneauBloc,
            ]),
            medecin_module_1.MedecinModule,
        ],
        controllers: [notification_cpa_controller_1.NotificationCPAController, notification_alerte_controller_1.NotificationAlerteController],
        providers: [notification_cpa_service_1.NotificationCPAService, notification_alerte_service_1.NotificationAlerteService],
        exports: [notification_cpa_service_1.NotificationCPAService, notification_alerte_service_1.NotificationAlerteService],
    })
], NotificationCPAModule);
//# sourceMappingURL=notification-cpa.module.js.map