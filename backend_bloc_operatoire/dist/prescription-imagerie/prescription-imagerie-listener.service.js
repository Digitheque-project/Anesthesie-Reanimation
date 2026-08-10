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
var PrescriptionImagerieListenerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionImagerieListenerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const socket_io_client_1 = require("socket.io-client");
const notification_cpa_entity_1 = require("../entities/notification-cpa.entity");
const patient_bloc_entity_1 = require("../entities/patient-bloc.entity");
const prescription_imagerie_client_1 = require("../external/prescription-imagerie.client");
const prescription_service_1 = require("../prescription/prescription.service");
const service_registry_client_1 = require("../external/service-registry.client");
const notification_back_client_1 = require("../external/notification-back.client");
let PrescriptionImagerieListenerService = PrescriptionImagerieListenerService_1 = class PrescriptionImagerieListenerService {
    config;
    prescriptionImagerieClient;
    prescriptionService;
    serviceRegistryClient;
    notificationBackClient;
    notificationRepo;
    patientBlocRepo;
    logger = new common_1.Logger(PrescriptionImagerieListenerService_1.name);
    socket = null;
    serviceId;
    constructor(config, prescriptionImagerieClient, prescriptionService, serviceRegistryClient, notificationBackClient, notificationRepo, patientBlocRepo) {
        this.config = config;
        this.prescriptionImagerieClient = prescriptionImagerieClient;
        this.prescriptionService = prescriptionService;
        this.serviceRegistryClient = serviceRegistryClient;
        this.notificationBackClient = notificationBackClient;
        this.notificationRepo = notificationRepo;
        this.patientBlocRepo = patientBlocRepo;
        this.serviceId =
            this.config.get('externalServices.serviceId') ?? '';
    }
    onModuleInit() {
        const notificationUrl = this.config.get('externalServices.notificationApiUrl');
        if (!notificationUrl || !this.serviceId) {
            this.logger.warn('NOTIFICATION_API_URL ou SERVICE_ID manquant — écoute temps réel des prescriptions désactivée');
            return;
        }
        this.socket = (0, socket_io_client_1.io)(`${notificationUrl}/notifications`, {
            query: { serviceId: this.serviceId },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 3000,
        });
        this.socket.on('connect', () => {
            this.logger.log(`Connecté au service Notification (temps réel) en tant que service ${this.serviceId}`);
        });
        this.socket.on('disconnect', (reason) => {
            this.logger.warn(`Déconnecté du service Notification : ${reason}`);
        });
        this.socket.on('connect_error', (err) => {
            this.logger.error(`Erreur de connexion au service Notification : ${err.message}`);
        });
        this.socket.on('notification', (notif) => this.traiterNotification(notif));
    }
    onModuleDestroy() {
        this.socket?.disconnect();
        this.socket = null;
    }
    estNotificationPrescription(notif) {
        const type = String(notif?.type || '').toLowerCase();
        const source = String(notif?.source || '').toLowerCase();
        return (Boolean(notif?.data?.patientId) &&
            (type.includes('prescription') || source.includes('prescription')));
    }
    async traiterNotification(notif) {
        if (!this.estNotificationPrescription(notif))
            return;
        const patientId = String(notif.data.patientId);
        this.logger.log(`📬 Notification de prescription reçue pour le patient ${patientId}`);
        this.prescriptionService
            .pollPrescriptionsBloc()
            .catch((err) => this.logger.error(`Erreur lors du poll bloc déclenché par notification: ${err.message}`));
        try {
            const prescriptions = await this.prescriptionImagerieClient.getParPatient(patientId);
            const nousConcernant = prescriptions.filter((p) => !p.serviceIdDest || p.serviceIdDest === this.serviceId);
            for (const prescription of nousConcernant) {
                await this.ingerer(prescription);
            }
        }
        catch (err) {
            this.logger.error(`Erreur ingestion prescription imagerie pour ${patientId}: ${err.message}`);
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
    async ingerer(prescription) {
        const dejaEnAttente = await this.notificationRepo.findOne({
            where: {
                patientId: prescription.patientId,
                statut: notification_cpa_entity_1.StatutNotificationCPA.EN_ATTENTE,
            },
        });
        if (dejaEnAttente)
            return;
        const dejaTraite = await this.patientBlocRepo.findOne({
            where: { patientId: prescription.patientId },
        });
        if (dejaTraite && dejaTraite.statut !== patient_bloc_entity_1.PatientStatut.EN_ATTENTE_CPA) {
            return;
        }
        const urgence = (prescription.urgence || '').toUpperCase();
        const estUrgent = urgence !== '' && !urgence.startsWith('NORMAL');
        const prescripteurNom = [
            prescription.prescripteurPrenomManuel,
            prescription.prescripteurNomManuel,
        ]
            .filter(Boolean)
            .join(' ')
            .trim();
        const serviceSourceNom = await this.serviceRegistryClient.getServiceName(prescription.serviceIdSource);
        try {
            const dejaSuivi = await this.patientBlocRepo.findOne({
                where: { patientId: prescription.patientId },
            });
            if (!dejaSuivi) {
                await this.patientBlocRepo.save(this.patientBlocRepo.create({
                    patientId: prescription.patientId,
                    chuId: prescription.chuId ||
                        this.config.get('externalServices.chuId') ||
                        undefined,
                    idDossier: `CHU-${Date.now()}`,
                    groupeSanguin: 'INCONNU',
                    libelle: prescription.type || 'Prescription imagerie',
                    alertes: prescription.alertes || undefined,
                    prescripteurId: prescription.prescripteurId,
                    statut: patient_bloc_entity_1.PatientStatut.EN_ATTENTE_CPA,
                    niveauUrgence: this.mapUrgence(prescription.urgence),
                    serviceOrigineId: prescription.serviceIdSource || undefined,
                    serviceOrigine: serviceSourceNom || undefined,
                }));
            }
        }
        catch (err) {
            this.logger.error(`❌ Échec création PatientBloc depuis la prescription imagerie pour ${prescription.patientId}: ${err.message}`);
        }
        const notif = await this.notificationRepo.save(this.notificationRepo.create({
            heurePrescription: new Date().toTimeString().substring(0, 5),
            patientId: prescription.patientId,
            intervention: prescription.type || 'Prescription imagerie',
            chirurgienNom: prescripteurNom || undefined,
            serviceSourceId: prescription.serviceIdSource || undefined,
            serviceSourceNom: serviceSourceNom || undefined,
            estUrgent,
            statut: notification_cpa_entity_1.StatutNotificationCPA.EN_ATTENTE,
        }));
        this.logger.log(`📋 Prescription imagerie ingérée pour le patient ${prescription.patientId} (${prescription.type || 'examen'})`);
        await this.notificationBackClient.notifyService({
            serviceId: this.serviceId,
            title: estUrgent
                ? '🔴 Prescription imagerie urgente reçue'
                : '📋 Nouvelle prescription imagerie reçue',
            message: `${prescription.type || 'Examen imagerie'} — patient ${prescription.patientId}`,
            type: 'new_prescription',
            source: 'bloc-operatoire',
            data: {
                patientId: prescription.patientId,
                notificationId: notif.id,
                urgence: prescription.urgence,
            },
        });
    }
};
exports.PrescriptionImagerieListenerService = PrescriptionImagerieListenerService;
exports.PrescriptionImagerieListenerService = PrescriptionImagerieListenerService = PrescriptionImagerieListenerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(5, (0, typeorm_1.InjectRepository)(notification_cpa_entity_1.NotificationCPA)),
    __param(6, (0, typeorm_1.InjectRepository)(patient_bloc_entity_1.PatientBloc)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prescription_imagerie_client_1.PrescriptionImagerieClient,
        prescription_service_1.PrescriptionService,
        service_registry_client_1.ServiceRegistryClient,
        notification_back_client_1.NotificationBackClient,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PrescriptionImagerieListenerService);
//# sourceMappingURL=prescription-imagerie-listener.service.js.map