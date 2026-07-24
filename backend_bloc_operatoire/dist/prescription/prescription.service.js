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
var PrescriptionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const config_1 = require("@nestjs/config");
const typeorm_2 = require("typeorm");
const patient_bloc_entity_1 = require("../entities/patient-bloc.entity");
const notification_cpa_entity_1 = require("../entities/notification-cpa.entity");
const prescription_externe_client_1 = require("../external/prescription-externe.client");
const notification_back_client_1 = require("../external/notification-back.client");
let PrescriptionService = PrescriptionService_1 = class PrescriptionService {
    patientBlocRepo;
    notificationRepo;
    prescriptionClient;
    notificationBackClient;
    config;
    logger = new common_1.Logger(PrescriptionService_1.name);
    polling = false;
    constructor(patientBlocRepo, notificationRepo, prescriptionClient, notificationBackClient, config) {
        this.patientBlocRepo = patientBlocRepo;
        this.notificationRepo = notificationRepo;
        this.prescriptionClient = prescriptionClient;
        this.notificationBackClient = notificationBackClient;
        this.config = config;
    }
    async processPrescription(dto) {
        this.logger.log(`📦 Notification de prescription reçue (type ${dto.type}, patient ${dto.patientId}) — synchronisation immédiate`);
        this.pollPrescriptionsBloc().catch((err) => this.logger.error(`Erreur lors de la synchronisation déclenchée par webhook: ${err.message}`));
        return true;
    }
    async pollPrescriptionsBloc() {
        if (this.polling)
            return;
        const serviceId = this.config.get('externalServices.serviceId');
        if (!serviceId)
            return;
        this.polling = true;
        try {
            const prescriptions = await this.prescriptionClient.getPrescriptionsBloc(serviceId);
            for (const p of prescriptions) {
                try {
                    await this.ingerer(p, serviceId);
                }
                catch (err) {
                    this.logger.error(`Erreur ingestion prescription ${p.id}: ${err.message}`);
                }
            }
        }
        finally {
            this.polling = false;
        }
    }
    mapUrgence(urgence) {
        const u = (urgence || '').toUpperCase();
        if (u === 'TRES_URGENT' || u === 'STAT')
            return patient_bloc_entity_1.NiveauUrgence.TRES_URGENT;
        if (u === 'URGENT' || u === 'URGENTE')
            return patient_bloc_entity_1.NiveauUrgence.URGENT;
        return patient_bloc_entity_1.NiveauUrgence.NORMAL;
    }
    async ingerer(p, serviceId) {
        const dejaIngeree = await this.patientBlocRepo.findOne({
            where: { prescriptionExterneId: p.id },
        });
        if (dejaIngeree)
            return;
        const notificationDejaEnAttente = await this.notificationRepo.findOne({
            where: {
                patientId: p.patientId,
                statut: notification_cpa_entity_1.StatutNotificationCPA.EN_ATTENTE,
            },
        });
        if (notificationDejaEnAttente)
            return;
        const acte = p.actes?.[0];
        const niveauUrgence = this.mapUrgence(p.urgence);
        let patient = await this.patientBlocRepo.findOne({
            where: { patientId: p.patientId },
        });
        const donneesPatient = {
            patientId: p.patientId,
            chuId: p.chuId,
            idDossier: patient?.idDossier || p.patientId,
            groupeSanguin: patient?.groupeSanguin || 'INCONNU',
            libelle: acte?.libelle || undefined,
            risqueHemorragique: acte?.risqueHemorragique || undefined,
            typeChirurgie: acte?.typeChirurgie || undefined,
            consignes: p.consignes || undefined,
            dateIntervention: p.dateIntervention
                ? new Date(p.dateIntervention)
                : undefined,
            alertes: p.alertes || undefined,
            prescripteurId: p.prescripteurId,
            chirurgien_nom: p.chirurgien || undefined,
            statut: patient_bloc_entity_1.PatientStatut.EN_ATTENTE_CPA,
            niveauUrgence,
            serviceOrigineId: p.serviceIdSource || undefined,
            prescriptionExterneId: p.id,
        };
        if (patient) {
            Object.assign(patient, donneesPatient);
            await this.patientBlocRepo.save(patient);
        }
        else {
            patient = await this.patientBlocRepo.save(this.patientBlocRepo.create(donneesPatient));
        }
        const notif = await this.notificationRepo.save(this.notificationRepo.create({
            heurePrescription: new Date().toTimeString().substring(0, 5),
            dateIntervention: p.dateIntervention
                ? new Date(p.dateIntervention)
                : undefined,
            patientId: p.patientId,
            intervention: acte?.libelle || 'Intervention',
            chirurgienId: undefined,
            chirurgienNom: p.chirurgien || undefined,
            professeurCPA: undefined,
            estUrgent: niveauUrgence !== patient_bloc_entity_1.NiveauUrgence.NORMAL,
            statut: notification_cpa_entity_1.StatutNotificationCPA.EN_ATTENTE,
        }));
        this.logger.log(`📋 Nouvelle prescription bloc ingérée pour patient ${p.patientId} (${acte?.libelle || 'intervention'})`);
        await this.prescriptionClient.updateStatut(p.id, 'RECU_BLOC');
        await this.notificationBackClient.notifyService({
            serviceId,
            title: niveauUrgence !== patient_bloc_entity_1.NiveauUrgence.NORMAL
                ? '🔴 Prescription urgente reçue'
                : '📋 Nouvelle prescription reçue',
            message: `${acte?.libelle || 'Intervention'} — patient ${p.patientId}`,
            type: 'new_prescription',
            source: 'bloc-operatoire',
            data: {
                patientId: p.patientId,
                notificationId: notif.id,
                urgence: p.urgence,
            },
        });
    }
};
exports.PrescriptionService = PrescriptionService;
__decorate([
    (0, schedule_1.Interval)(15000),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PrescriptionService.prototype, "pollPrescriptionsBloc", null);
exports.PrescriptionService = PrescriptionService = PrescriptionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(patient_bloc_entity_1.PatientBloc)),
    __param(1, (0, typeorm_1.InjectRepository)(notification_cpa_entity_1.NotificationCPA)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        prescription_externe_client_1.PrescriptionExterneClient,
        notification_back_client_1.NotificationBackClient,
        config_1.ConfigService])
], PrescriptionService);
//# sourceMappingURL=prescription.service.js.map