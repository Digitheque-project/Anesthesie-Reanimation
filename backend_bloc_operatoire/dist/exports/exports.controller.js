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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportsController = void 0;
const common_1 = require("@nestjs/common");
const exports_service_1 = require("./exports.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ExportsController = class ExportsController {
    exportsService;
    constructor(exportsService) {
        this.exportsService = exportsService;
    }
    async exportPatientsExcel(res) {
        const buffer = await this.exportsService.exportPatientsExcel();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=patients.xlsx');
        res.send(buffer);
    }
    async exportPlanningExcel(date, res) {
        const buffer = await this.exportsService.exportPlanningExcel(date);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=planning_${date}.xlsx`);
        res.send(buffer);
    }
    async exportPatientJSON(id, res) {
        const buffer = await this.exportsService.exportPatientJSON(id);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=dossier_json_${id}.pdf`);
        res.send(buffer);
    }
};
exports.ExportsController = ExportsController;
__decorate([
    (0, common_1.Get)('patients/excel'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExportsController.prototype, "exportPatientsExcel", null);
__decorate([
    (0, common_1.Get)('planning/excel'),
    __param(0, (0, common_1.Query)('date')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExportsController.prototype, "exportPlanningExcel", null);
__decorate([
    (0, common_1.Get)('patient/:id/pdf'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExportsController.prototype, "exportPatientJSON", null);
exports.ExportsController = ExportsController = __decorate([
    (0, common_1.Controller)('exports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [exports_service_1.ExportsService])
], ExportsController);
//# sourceMappingURL=exports.controller.js.map