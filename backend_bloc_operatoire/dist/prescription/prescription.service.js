"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PrescriptionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionService = void 0;
const common_1 = require("@nestjs/common");
let PrescriptionService = PrescriptionService_1 = class PrescriptionService {
    logger = new common_1.Logger(PrescriptionService_1.name);
    async processPrescription(dto) {
        this.logger.log(`📦 Traitement prescription: ${JSON.stringify(dto)}`);
        this.logger.log(`✅ Prescription de type ${dto.type} traitée avec succès`);
        return true;
    }
};
exports.PrescriptionService = PrescriptionService;
exports.PrescriptionService = PrescriptionService = PrescriptionService_1 = __decorate([
    (0, common_1.Injectable)()
], PrescriptionService);
//# sourceMappingURL=prescription.service.js.map