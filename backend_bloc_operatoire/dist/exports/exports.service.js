"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const patient_bloc_entity_1 = require("../entities/patient-bloc.entity");
const activite_per_op_entity_1 = require("../entities/activite-per-op.entity");
const accueil_client_1 = require("../external/accueil.client");
const medecin_identite_service_1 = require("../medecin/medecin-identite.service");
const ExcelJS = __importStar(require("exceljs"));
let ExportsService = class ExportsService {
    patientBlocRepo;
    activiteRepo;
    accueilClient;
    medecinIdentiteService;
    constructor(patientBlocRepo, activiteRepo, accueilClient, medecinIdentiteService) {
        this.patientBlocRepo = patientBlocRepo;
        this.activiteRepo = activiteRepo;
        this.accueilClient = accueilClient;
        this.medecinIdentiteService = medecinIdentiteService;
    }
    async exportPatientsExcel() {
        const patients = await this.patientBlocRepo.find({ order: { createdAt: 'DESC' } });
        const enriched = await this.accueilClient.enrichWithIdentity(patients);
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Patients');
        sheet.columns = [
            { header: 'ID Dossier', key: 'idDossier', width: 15 },
            { header: 'Nom', key: 'nom', width: 20 },
            { header: 'Prénom', key: 'prenom', width: 20 },
            { header: 'Statut', key: 'statut', width: 20 },
            { header: 'Urgence', key: 'niveauUrgence', width: 15 },
            { header: 'Chambre', key: 'chambre', width: 10 },
        ];
        enriched.forEach((p) => sheet.addRow({
            idDossier: p.idDossier,
            nom: p.patient?.nom ?? '',
            prenom: p.patient?.prenom ?? '',
            statut: p.statut,
            niveauUrgence: p.niveauUrgence,
            chambre: p.chambre,
        }));
        return workbook.xlsx.writeBuffer();
    }
    async exportPlanningExcel(date) {
        const activites = await this.activiteRepo.find({ where: { dateOperation: new Date(date) } });
        const enrichedPatient = await this.accueilClient.enrichWithIdentity(activites);
        const enriched = await this.medecinIdentiteService.enrichir(enrichedPatient, 'chirurgienId', 'chirurgien');
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Planning');
        sheet.columns = [
            { header: 'Patient', key: 'patient', width: 30 },
            { header: 'Chirurgien', key: 'chirurgien', width: 30 },
            { header: 'Date', key: 'date', width: 15 },
        ];
        enriched.forEach((a) => sheet.addRow({
            patient: a.patient ? `${a.patient.nom} ${a.patient.prenom}` : a.patientId,
            chirurgien: a.chirurgien ? `${a.chirurgien.nom} ${a.chirurgien.prenom}` : '—',
            date: a.dateOperation,
        }));
        return workbook.xlsx.writeBuffer();
    }
    async exportPatientJSON(patientId) {
        const patient = await this.patientBlocRepo.findOne({ where: { patientId } });
        if (!patient)
            throw new common_1.NotFoundException('Patient non trouvé');
        const identite = await this.accueilClient.getPatient(patientId);
        return { ...patient, ...identite, patientId };
    }
};
exports.ExportsService = ExportsService;
exports.ExportsService = ExportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(patient_bloc_entity_1.PatientBloc)),
    __param(1, (0, typeorm_1.InjectRepository)(activite_per_op_entity_1.ActivitePerOp)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        accueil_client_1.AccueilClient,
        medecin_identite_service_1.MedecinIdentiteService])
], ExportsService);
//# sourceMappingURL=exports.service.js.map