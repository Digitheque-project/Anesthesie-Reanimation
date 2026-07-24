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
const prescription_imagerie_client_1 = require("../external/prescription-imagerie.client");
const prescription_service_1 = require("../prescription/prescription.service");
let PrescriptionImagerieListenerService = PrescriptionImagerieListenerService_1 = class PrescriptionImagerieListenerService {
    config;
    prescriptionImagerieClient;
    prescriptionService;
    notificationRepo;
    logger = new common_1.Logger(PrescriptionImagerieListenerService_1.name);
    socket = null;
    serviceId;
    constructor(config, prescriptionImagerieClient, prescriptionService, notificationRepo) {
        this.config = config;
        this.prescriptionImagerieClient = prescriptionImagerieClient;
        this.prescriptionService = prescriptionService;
        this.notificationRepo = notificationRepo;
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
    async ingerer(prescription) {
        const dejaEnAttente = await this.notificationRepo.findOne({
            where: {
                patientId: prescription.patientId,
                statut: notification_cpa_entity_1.StatutNotificationCPA.EN_ATTENTE,
            },
        });
        if (dejaEnAttente)
            return;
        const urgence = (prescription.urgence || '').toUpperCase();
        const estUrgent = urgence !== '' && !urgence.startsWith('NORMAL');
        const prescripteurNom = [
            prescription.prescripteurPrenomManuel,
            prescription.prescripteurNomManuel,
        ]
            .filter(Boolean)
            .join(' ')
            .trim();
        await this.notificationRepo.save(this.notificationRepo.create({
            heurePrescription: new Date().toTimeString().substring(0, 5),
            patientId: prescription.patientId,
            intervention: prescription.type || 'Prescription imagerie',
            chirurgienNom: prescripteurNom || undefined,
            estUrgent,
            statut: notification_cpa_entity_1.StatutNotificationCPA.EN_ATTENTE,
        }));
        this.logger.log(`📋 Prescription imagerie ingérée pour le patient ${prescription.patientId} (${prescription.type || 'examen'})`);
    }
};
exports.PrescriptionImagerieListenerService = PrescriptionImagerieListenerService;
exports.PrescriptionImagerieListenerService = PrescriptionImagerieListenerService = PrescriptionImagerieListenerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, typeorm_1.InjectRepository)(notification_cpa_entity_1.NotificationCPA)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prescription_imagerie_client_1.PrescriptionImagerieClient,
        prescription_service_1.PrescriptionService,
        typeorm_2.Repository])
], PrescriptionImagerieListenerService);
//# sourceMappingURL=prescription-imagerie-listener.service.js.map