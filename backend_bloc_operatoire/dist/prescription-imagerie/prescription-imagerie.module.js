"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionImagerieModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const notification_cpa_entity_1 = require("../entities/notification-cpa.entity");
const prescription_imagerie_listener_service_1 = require("./prescription-imagerie-listener.service");
const prescription_module_1 = require("../prescription/prescription.module");
let PrescriptionImagerieModule = class PrescriptionImagerieModule {
};
exports.PrescriptionImagerieModule = PrescriptionImagerieModule;
exports.PrescriptionImagerieModule = PrescriptionImagerieModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([notification_cpa_entity_1.NotificationCPA]), prescription_module_1.PrescriptionModule],
        providers: [prescription_imagerie_listener_service_1.PrescriptionImagerieListenerService],
    })
], PrescriptionImagerieModule);
//# sourceMappingURL=prescription-imagerie.module.js.map