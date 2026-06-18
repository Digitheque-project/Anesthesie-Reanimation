"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PrescriptionController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prescription_service_1 = require("./prescription.service");
const receive_prescription_dto_1 = require("./dto/receive-prescription.dto");
let PrescriptionController = PrescriptionController_1 = class PrescriptionController {
    service;
    logger = new common_1.Logger(PrescriptionController_1.name);
    constructor(service) {
        this.service = service;
    }
    async receivePrescription(dto) {
        this.logger.log(`📋 Prescription reçue du service Prescription pour patient ${dto.patientId}`);
        const result = await this.service.processPrescription(dto);
        return { received: true, processed: result, timestamp: new Date().toISOString() };
    }
};
exports.PrescriptionController = PrescriptionController;
__decorate([
    (0, common_1.Post)('receive'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: '📋 Recevoir une prescription du service Prescription' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Prescription reçue avec succès' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [receive_prescription_dto_1.ReceivePrescriptionDto]),
    __metadata("design:returntype", Promise)
], PrescriptionController.prototype, "receivePrescription", null);
exports.PrescriptionController = PrescriptionController = PrescriptionController_1 = __decorate([
    (0, swagger_1.ApiTags)('Prescription'),
    (0, common_1.Controller)('prescription'),
    __metadata("design:paramtypes", [prescription_service_1.PrescriptionService])
], PrescriptionController);
//# sourceMappingURL=prescription.controller.js.map