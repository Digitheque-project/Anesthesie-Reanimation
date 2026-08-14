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
var WebhookNotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookNotificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const typeorm_2 = require("typeorm");
const webhook_notification_entity_1 = require("../entities/webhook-notification.entity");
const patient_bloc_entity_1 = require("../entities/patient-bloc.entity");
const notification_cpa_entity_1 = require("../entities/notification-cpa.entity");
const ingestion_externe_entity_1 = require("../entities/ingestion-externe.entity");
const ingestion_ledger_service_1 = require("../ingestion/ingestion-ledger.service");
const service_registry_client_1 = require("../external/service-registry.client");
const notification_back_client_1 = require("../external/notification-back.client");
const urgence_1 = require("../common/urgence");
const id_dossier_1 = require("../common/id-dossier");
const TYPES_SORTANTS = new Set([
    'CPA_APTE',
    'CPA_INAPTE',
    'CPA_REPORT',
    'CPA_RESULTAT',
    'VPA_REALISEE',
    'RDV_CPA_PLANIFIE',
    'RETOUR_SERVICE_ORIGINE',
    'DATE_OPERATION_MODIFIEE',
    'demande_cpa_resultat',
    'demande_vpa_resultat',
    'patient_statut_change',
]);
let WebhookNotificationService = WebhookNotificationService_1 = class WebhookNotificationService {
    webhookRepo;
    patientBlocRepo;
    notificationRepo;
    ingestionLedger;
    serviceRegistryClient;
    notificationBackClient;
    config;
    logger = new common_1.Logger(WebhookNotificationService_1.name);
    blocServiceId;
    constructor(webhookRepo, patientBlocRepo, notificationRepo, ingestionLedger, serviceRegistryClient, notificationBackClient, config) {
        this.webhookRepo = webhookRepo;
        this.patientBlocRepo = patientBlocRepo;
        this.notificationRepo = notificationRepo;
        this.ingestionLedger = ingestionLedger;
        this.serviceRegistryClient = serviceRegistryClient;
        this.notificationBackClient = notificationBackClient;
        this.config = config;
        this.blocServiceId =
            this.config.get('externalServices.serviceId') ?? '';
    }
    async processIncomingNotification(payload, sourceService) {
        this.logger.log(`📦 Webhook reçu: ${JSON.stringify(payload)}`);
        let notification;
        try {
            notification = this.webhookRepo.create({
                type: payload.type,
                motif: payload.motif || payload.message,
                patientId: payload.patientId || payload.targetId,
                sourceServiceId: payload.sourceServiceId || payload.emitter,
                sourceServiceName: payload.sourceServiceName || payload.emitterName || sourceService,
                targetServiceId: payload.targetServiceId || payload.recipient,
                targetServiceName: payload.targetServiceName || payload.recipientName,
                urgence: payload.urgence,
                payload: payload.payload ?? payload,
                channels: payload.channels,
                processed: false,
            });
            await this.webhookRepo.save(notification);
            this.logger.log(`✅ Notification stockée (ID: ${notification.id})`);
        }
        catch (error) {
            this.logger.error(`❌ Erreur: ${error.message}`);
            return true;
        }
        await this.admettrePatient(payload, notification).catch((err) => this.logger.error(`❌ Échec admission depuis le webhook ${notification.id}: ${err.message}`));
        return true;
    }
    async admettrePatient(payload, notification) {
        const patientId = notification.patientId;
        if (!patientId)
            return;
        const type = String(payload?.type ?? '');
        if (TYPES_SORTANTS.has(type))
            return;
        if (String(payload?.source ?? '').toLowerCase() === 'bloc-operatoire' ||
            (this.blocServiceId && payload?.emitter === this.blocServiceId)) {
            return;
        }
        const reference = payload?.referenceId ??
            payload?.entiteRefId ??
            payload?.sourceReferenceId ??
            payload?.id ??
            null;
        if (await this.ingestionLedger.dejaIngeree(ingestion_externe_entity_1.CanalIngestion.WEBHOOK_SERVICE, reference)) {
            return;
        }
        const episodeEngage = [
            patient_bloc_entity_1.PatientStatut.CPA_REALISE,
            patient_bloc_entity_1.PatientStatut.EN_ATTENTE_VERIFICATION_VEILLE,
            patient_bloc_entity_1.PatientStatut.VERIFICATION_VEILLE_REALISEE,
            patient_bloc_entity_1.PatientStatut.PRET_POUR_BLOC,
            patient_bloc_entity_1.PatientStatut.EN_COURS_OPERATION,
            patient_bloc_entity_1.PatientStatut.EN_SALLE_REVEIL,
        ];
        const [patient, notificationDejaOuverte] = await Promise.all([
            this.patientBlocRepo.findOne({ where: { patientId } }),
            this.notificationRepo.findOne({
                where: {
                    patientId,
                    statut: (0, typeorm_2.In)([
                        notification_cpa_entity_1.StatutNotificationCPA.EN_ATTENTE,
                        notification_cpa_entity_1.StatutNotificationCPA.RDV_PLANIFIE,
                    ]),
                },
            }),
        ]);
        if (notificationDejaOuverte ||
            (patient && episodeEngage.includes(patient.statut))) {
            return;
        }
        const niveauUrgence = (0, urgence_1.niveauDepuisLibelle)(payload?.urgence ?? payload?.payload?.urgence);
        const serviceSourceId = notification.sourceServiceId || null;
        const serviceSourceNom = (await this.serviceRegistryClient.getServiceName(serviceSourceId)) ||
            notification.sourceServiceName ||
            null;
        const libelle = payload?.intervention ||
            payload?.motif ||
            payload?.message ||
            notification.motif ||
            'Prise en charge demandée';
        const donnees = {
            patientId,
            chuId: payload?.chuId ||
                patient?.chuId ||
                this.config.get('externalServices.chuId'),
            idDossier: patient?.idDossier || (0, id_dossier_1.construireIdDossier)(patientId),
            groupeSanguin: patient?.groupeSanguin || 'INCONNU',
            libelle: String(libelle).slice(0, 255),
            statut: patient_bloc_entity_1.PatientStatut.EN_ATTENTE_CPA,
            niveauUrgence,
            serviceOrigineId: serviceSourceId ?? undefined,
            serviceOrigine: serviceSourceNom ?? undefined,
        };
        if (patient) {
            Object.assign(patient, donnees);
            await this.patientBlocRepo.save(patient);
        }
        else {
            await this.patientBlocRepo.save(this.patientBlocRepo.create(donnees));
        }
        const notif = await this.notificationRepo.save(this.notificationRepo.create({
            heurePrescription: new Date().toTimeString().substring(0, 5),
            patientId,
            intervention: String(libelle).slice(0, 255),
            serviceSourceId: serviceSourceId ?? undefined,
            serviceSourceNom: serviceSourceNom ?? undefined,
            estUrgent: (0, urgence_1.estNiveauUrgent)(niveauUrgence),
            statut: notification_cpa_entity_1.StatutNotificationCPA.EN_ATTENTE,
        }));
        notification.processed = true;
        await this.webhookRepo.save(notification);
        await this.ingestionLedger.marquerIngeree({
            canal: ingestion_externe_entity_1.CanalIngestion.WEBHOOK_SERVICE,
            referenceExterne: reference,
            patientId,
            serviceSourceId,
            libelle: String(libelle),
        });
        this.logger.log(`📋 Patient ${patientId} admis au bloc depuis le webhook générique (${serviceSourceNom || serviceSourceId || 'service inconnu'})`);
        await this.notificationBackClient.notifyService({
            serviceId: this.blocServiceId,
            title: (0, urgence_1.estNiveauUrgent)(niveauUrgence)
                ? '🔴 Demande de prise en charge urgente reçue'
                : '📋 Nouvelle demande de prise en charge reçue',
            message: `${libelle} — patient ${patientId}`,
            type: 'new_prescription',
            source: 'bloc-operatoire',
            data: {
                patientId,
                notificationId: notif.id,
                urgence: payload?.urgence,
            },
        });
    }
};
exports.WebhookNotificationService = WebhookNotificationService;
exports.WebhookNotificationService = WebhookNotificationService = WebhookNotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(webhook_notification_entity_1.WebhookNotification)),
    __param(1, (0, typeorm_1.InjectRepository)(patient_bloc_entity_1.PatientBloc)),
    __param(2, (0, typeorm_1.InjectRepository)(notification_cpa_entity_1.NotificationCPA)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        ingestion_ledger_service_1.IngestionLedgerService,
        service_registry_client_1.ServiceRegistryClient,
        notification_back_client_1.NotificationBackClient,
        config_1.ConfigService])
], WebhookNotificationService);
//# sourceMappingURL=webhook-notification.service.js.map