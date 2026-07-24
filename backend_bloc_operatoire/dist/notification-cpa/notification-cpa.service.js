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
var NotificationCPAService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationCPAService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_cpa_entity_1 = require("../entities/notification-cpa.entity");
const webhook_notification_entity_1 = require("../entities/webhook-notification.entity");
const patient_bloc_entity_1 = require("../entities/patient-bloc.entity");
const accueil_client_1 = require("../external/accueil.client");
const medecin_identite_service_1 = require("../medecin/medecin-identite.service");
const notification_outgoing_service_1 = require("../external/notification-outgoing.service");
let NotificationCPAService = NotificationCPAService_1 = class NotificationCPAService {
    notificationRepo;
    webhookRepo;
    patientBlocRepo;
    accueilClient;
    medecinIdentiteService;
    notificationOutgoing;
    logger = new common_1.Logger(NotificationCPAService_1.name);
    constructor(notificationRepo, webhookRepo, patientBlocRepo, accueilClient, medecinIdentiteService, notificationOutgoing) {
        this.notificationRepo = notificationRepo;
        this.webhookRepo = webhookRepo;
        this.patientBlocRepo = patientBlocRepo;
        this.accueilClient = accueilClient;
        this.medecinIdentiteService = medecinIdentiteService;
        this.notificationOutgoing = notificationOutgoing;
    }
    async create(dto) {
        const saved = await this.notificationRepo.save(this.notificationRepo.create(dto));
        return Array.isArray(saved) ? saved[0] : saved;
    }
    async findAll(page = 1, limite = 10) {
        const [internalDataRaw, internalTotal] = await this.notificationRepo.findAndCount({
            skip: (page - 1) * limite,
            take: limite,
            order: { createdAt: 'DESC' },
        });
        const identities = await this.accueilClient.enrichWithIdentity(internalDataRaw);
        const avecChirurgien = await this.medecinIdentiteService.enrichir(internalDataRaw, 'chirurgienId', 'chirurgien');
        const patientIds = Array.from(new Set(internalDataRaw.map((n) => n.patientId).filter(Boolean)));
        const patients = patientIds.length
            ? await this.patientBlocRepo.find({ where: { patientId: (0, typeorm_2.In)(patientIds) } })
            : [];
        const patientMap = new Map(patients.map((p) => [p.patientId, p]));
        const internalData = internalDataRaw.map((n, idx) => {
            const identity = identities[idx] || {};
            const pb = patientMap.get(n.patientId);
            return {
                ...n,
                chirurgien: avecChirurgien[idx]?.chirurgien ?? null,
                patient: {
                    id: n.patientId,
                    nom: identity.nom,
                    prenom: identity.prenom,
                    idDossier: identity.idDossier ?? pb?.idDossier,
                    statut: pb?.statut,
                    niveauUrgence: pb?.niveauUrgence,
                },
            };
        });
        const externalData = await this.webhookRepo.find({
            order: { receivedAt: 'DESC' },
            take: limite,
        });
        const merged = [...internalData, ...externalData];
        merged.sort((a, b) => {
            const getDate = (item) => {
                if (item.createdAt)
                    return new Date(item.createdAt).getTime();
                if (item.receivedAt)
                    return new Date(item.receivedAt).getTime();
                return 0;
            };
            return getDate(b) - getDate(a);
        });
        const start = (page - 1) * limite;
        const end = start + limite;
        const paginated = merged.slice(start, end);
        return {
            data: paginated,
            total: merged.length,
            page,
            pages: Math.ceil(merged.length / limite),
        };
    }
    async findOne(id) {
        const n = await this.notificationRepo.findOne({ where: { id } });
        if (!n)
            throw new common_1.NotFoundException(`Notification ${id} non trouvée`);
        const [enrichedPatient] = await this.accueilClient.enrichWithIdentity([n]);
        const [enriched] = await this.medecinIdentiteService.enrichir([enrichedPatient], 'chirurgienId', 'chirurgien');
        return enriched;
    }
    async planifierRDV(id, dto) {
        const n = await this.notificationRepo.findOne({ where: { id } });
        if (!n)
            throw new common_1.NotFoundException(`Notification ${id} non trouvée`);
        n.statut = notification_cpa_entity_1.StatutNotificationCPA.RDV_PLANIFIE;
        try {
            const patient = await this.patientBlocRepo.findOne({ where: { patientId: n.patientId } });
            if (patient?.serviceOrigineId && patient?.serviceOrigine) {
                await this.notificationOutgoing.notifyOriginService({
                    patientId: n.patientId,
                    type: 'RDV_CPA_PLANIFIE',
                    serviceOrigineId: patient.serviceOrigineId,
                    serviceOrigineName: patient.serviceOrigine,
                    payload: {
                        intervention: n.intervention,
                        professeurCPA: n.professeurCPA,
                        estUrgent: n.estUrgent,
                        datePlanification: new Date().toISOString(),
                    },
                });
            }
        }
        catch (err) {
            this.logger.error(`Erreur notification service origine après planification RDV CPA: ${err.message}`);
        }
        return this.notificationRepo.save(n);
    }
    async update(id, dto) {
        const n = await this.notificationRepo.findOne({ where: { id } });
        if (!n)
            throw new common_1.NotFoundException(`Notification ${id} non trouvée`);
        return this.notificationRepo.save(Object.assign(n, dto));
    }
    async remove(id) {
        const n = await this.notificationRepo.findOne({ where: { id } });
        if (!n)
            throw new common_1.NotFoundException(`Notification ${id} non trouvée`);
        await this.notificationRepo.delete(id);
        return { message: 'Notification supprimée' };
    }
    async getUnreadCount() {
        const internalUnread = await this.notificationRepo.count({
            where: { statut: notification_cpa_entity_1.StatutNotificationCPA.EN_ATTENTE },
        });
        const externalUnread = await this.webhookRepo.count({
            where: { processed: false },
        });
        return internalUnread + externalUnread;
    }
};
exports.NotificationCPAService = NotificationCPAService;
exports.NotificationCPAService = NotificationCPAService = NotificationCPAService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_cpa_entity_1.NotificationCPA)),
    __param(1, (0, typeorm_1.InjectRepository)(webhook_notification_entity_1.WebhookNotification)),
    __param(2, (0, typeorm_1.InjectRepository)(patient_bloc_entity_1.PatientBloc)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        accueil_client_1.AccueilClient,
        medecin_identite_service_1.MedecinIdentiteService,
        notification_outgoing_service_1.NotificationOutgoingService])
], NotificationCPAService);
//# sourceMappingURL=notification-cpa.service.js.map