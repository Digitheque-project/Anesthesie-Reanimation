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
const config_1 = require("@nestjs/config");
const typeorm_2 = require("typeorm");
const notification_cpa_entity_1 = require("../entities/notification-cpa.entity");
const webhook_notification_entity_1 = require("../entities/webhook-notification.entity");
const patient_bloc_entity_1 = require("../entities/patient-bloc.entity");
const accueil_client_1 = require("../external/accueil.client");
const medecin_identite_service_1 = require("../medecin/medecin-identite.service");
const notification_outgoing_service_1 = require("../external/notification-outgoing.service");
const notification_back_client_1 = require("../external/notification-back.client");
let NotificationCPAService = NotificationCPAService_1 = class NotificationCPAService {
    notificationRepo;
    webhookRepo;
    patientBlocRepo;
    accueilClient;
    medecinIdentiteService;
    notificationOutgoing;
    notificationBackClient;
    config;
    logger = new common_1.Logger(NotificationCPAService_1.name);
    blocServiceId;
    constructor(notificationRepo, webhookRepo, patientBlocRepo, accueilClient, medecinIdentiteService, notificationOutgoing, notificationBackClient, config) {
        this.notificationRepo = notificationRepo;
        this.webhookRepo = webhookRepo;
        this.patientBlocRepo = patientBlocRepo;
        this.accueilClient = accueilClient;
        this.medecinIdentiteService = medecinIdentiteService;
        this.notificationOutgoing = notificationOutgoing;
        this.notificationBackClient = notificationBackClient;
        this.config = config;
        this.blocServiceId =
            this.config.get('externalServices.serviceId') ?? '';
    }
    async create(dto) {
        if (!dto.statut || dto.statut === notification_cpa_entity_1.StatutNotificationCPA.EN_ATTENTE) {
            const patient = await this.patientBlocRepo.findOne({
                where: { patientId: dto.patientId },
            });
            if (patient && patient.statut !== patient_bloc_entity_1.PatientStatut.EN_ATTENTE_CPA) {
                this.logger.warn(`Création d'une notification EN_ATTENTE refusée : patient ${dto.patientId} déjà traité (statut ${patient.statut})`);
                throw new common_1.ConflictException(`Patient ${dto.patientId} déjà traité (statut ${patient.statut}) — notification non créée.`);
            }
        }
        const saved = await this.notificationRepo.save(this.notificationRepo.create(dto));
        return Array.isArray(saved) ? saved[0] : saved;
    }
    async findAll(page = 1, limite = 10) {
        const [internalDataRaw, externalDataRaw] = await Promise.all([
            this.notificationRepo.find({ order: { createdAt: 'DESC' } }),
            this.webhookRepo.find({ order: { receivedAt: 'DESC' } }),
        ]);
        const patientIds = Array.from(new Set([...internalDataRaw, ...externalDataRaw]
            .map((n) => n.patientId)
            .filter(Boolean)));
        const patients = patientIds.length
            ? await this.patientBlocRepo.find({
                where: { patientId: (0, typeorm_2.In)(patientIds) },
            })
            : [];
        const patientMap = new Map(patients.map((p) => [p.patientId, p]));
<<<<<<< HEAD
        const dernierRdvPlanifie = new Map();
        for (const c of creneaux) {
            if (c.statut !== creneau_bloc_entity_1.StatutCreneau.PLANIFIE)
                continue;
            const quand = new Date(c.createdAt).getTime();
            const connu = dernierRdvPlanifie.get(c.patientId);
            if (connu === undefined || quand > connu) {
                dernierRdvPlanifie.set(c.patientId, quand);
            }
        }
        const estPatientTraite = (patientId, statut, creeLe) => {
            const rdv = patientId ? dernierRdvPlanifie.get(patientId) : undefined;
            if (rdv !== undefined) {
                const quandNotif = creeLe ? new Date(creeLe).getTime() : 0;
                if (!quandNotif || quandNotif <= rdv)
                    return true;
            }
            return !!statut && statut !== patient_bloc_entity_1.PatientStatut.EN_ATTENTE_CPA;
        };
        const internalData = internalDataRaw.map((n) => {
=======
        const estPatientTraite = (statut) => !!statut && statut !== patient_bloc_entity_1.PatientStatut.EN_ATTENTE_CPA;
        const internalData = internalDataRaw.map((n, idx) => {
            const identity = identities[idx] || {};
>>>>>>> a733407 (commit 1508)
            const pb = patientMap.get(n.patientId);
            return {
                ...n,
                estInterne: true,
                patient: {
                    id: n.patientId,
                    idDossier: pb?.idDossier,
                    statut: pb?.statut,
                    niveauUrgence: pb?.niveauUrgence,
                    dateIntervention: pb?.dateIntervention ?? null,
                },
            };
        });
        const externalData = externalDataRaw.map((n) => {
            const pb = patientMap.get(n.patientId);
            return {
                ...n,
                patient: pb
                    ? {
                        id: n.patientId,
                        statut: pb.statut,
                        niveauUrgence: pb.niveauUrgence,
                        dateIntervention: pb.dateIntervention ?? null,
                    }
                    : undefined,
            };
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
        const actionnables = merged.filter((n) => n.statut !== notification_cpa_entity_1.StatutNotificationCPA.EN_ATTENTE ||
<<<<<<< HEAD
            !estPatientTraite(n.patient?.id, n.patient?.statut, n.createdAt ?? n.receivedAt));
=======
            !estPatientTraite(n.patient?.statut));
>>>>>>> a733407 (commit 1508)
        const start = (page - 1) * limite;
        const end = start + limite;
        const paginated = actionnables.slice(start, end);
        const aEnrichir = paginated.filter((n) => n.estInterne);
        const [identites, avecChirurgien] = await Promise.all([
            this.accueilClient.enrichWithIdentity(aEnrichir),
            this.medecinIdentiteService.enrichir(aEnrichir, 'chirurgienId', 'chirurgien'),
        ]);
        const identiteParIndex = new Map();
        const chirurgienParIndex = new Map();
        aEnrichir.forEach((n, idx) => {
            identiteParIndex.set(n.id, identites[idx] || {});
            chirurgienParIndex.set(n.id, avecChirurgien[idx]?.chirurgien ?? null);
        });
        const data = paginated.map((n) => {
            if (!n.estInterne)
                return n;
            const identite = identiteParIndex.get(n.id) || {};
            const { estInterne, ...ligne } = n;
            return {
                ...ligne,
                chirurgien: chirurgienParIndex.get(n.id) ?? null,
                patient: {
                    ...n.patient,
                    nom: identite.nom,
                    prenom: identite.prenom,
                    idDossier: identite.idDossier ?? n.patient?.idDossier,
                },
            };
        });
        return {
            data,
            total: actionnables.length,
            page,
            pages: Math.ceil(actionnables.length / limite),
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
            const patient = await this.patientBlocRepo.findOne({
                where: { patientId: n.patientId },
            });
            if (patient?.serviceOrigineId) {
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
        const saved = await this.notificationRepo.save(n);
        this.notificationBackClient
            .notifyService({
            serviceId: this.blocServiceId,
            title: 'RDV CPA planifié',
            message: `Notification ${id} planifiée`,
            type: 'patient_statut_change',
            source: 'bloc-operatoire',
            data: { notificationId: id, patientId: n.patientId },
        })
            .catch(() => { });
        return saved;
    }
    async update(id, dto) {
        const n = await this.notificationRepo.findOne({ where: { id } });
        if (!n)
            throw new common_1.NotFoundException(`Notification ${id} non trouvée`);
        return this.notificationRepo.save(Object.assign(n, dto));
    }
    async marquerLu(id) {
        const n = await this.notificationRepo.findOne({ where: { id } });
        if (!n)
            throw new common_1.NotFoundException(`Notification ${id} non trouvée`);
        n.lu = true;
        n.luLe = new Date();
        return this.notificationRepo.save(n);
    }
    async remove(id) {
        const n = await this.notificationRepo.findOne({ where: { id } });
        if (!n)
            throw new common_1.NotFoundException(`Notification ${id} non trouvée`);
        await this.notificationRepo.delete(id);
        return { message: 'Notification supprimée' };
    }
    async getUnreadCount() {
<<<<<<< HEAD
        const [internalRaw, externalRaw] = await Promise.all([
            this.notificationRepo.find({
                where: { statut: notification_cpa_entity_1.StatutNotificationCPA.EN_ATTENTE, lu: false },
            }),
            this.webhookRepo.find({ where: { processed: false } }),
        ]);
        const ids = Array.from(new Set([...internalRaw, ...externalRaw]
            .map((n) => n.patientId)
            .filter(Boolean)));
        if (ids.length === 0)
            return 0;
        const [patients, creneaux] = await Promise.all([
            this.patientBlocRepo.find({ where: { patientId: (0, typeorm_2.In)(ids) } }),
            this.creneauRepo.find({ where: { patientId: (0, typeorm_2.In)(ids) } }),
        ]);
        const statutPatient = new Map(patients.map((p) => [p.patientId, p.statut]));
        const dernierRdvPlanifie = new Map();
        for (const c of creneaux) {
            if (c.statut !== creneau_bloc_entity_1.StatutCreneau.PLANIFIE)
                continue;
            const quand = new Date(c.createdAt).getTime();
            const connu = dernierRdvPlanifie.get(c.patientId);
            if (connu === undefined || quand > connu) {
                dernierRdvPlanifie.set(c.patientId, quand);
            }
        }
        const statutsTraites = new Set([
            patient_bloc_entity_1.PatientStatut.CPA_REALISE,
            patient_bloc_entity_1.PatientStatut.CPA_INAPTE,
            patient_bloc_entity_1.PatientStatut.EN_ATTENTE_VERIFICATION_VEILLE,
            patient_bloc_entity_1.PatientStatut.VERIFICATION_VEILLE_REALISEE,
            patient_bloc_entity_1.PatientStatut.PRET_POUR_BLOC,
            patient_bloc_entity_1.PatientStatut.EN_COURS_OPERATION,
            patient_bloc_entity_1.PatientStatut.EN_SALLE_REVEIL,
            patient_bloc_entity_1.PatientStatut.SORTI,
        ]);
        const patientDejaPriseEnCharge = (patientId, creeLe) => {
            if (!patientId)
                return false;
            const rdv = dernierRdvPlanifie.get(patientId);
            if (rdv !== undefined) {
                const quandNotif = creeLe ? new Date(creeLe).getTime() : 0;
                if (!quandNotif || quandNotif <= rdv)
                    return true;
            }
            const statut = statutPatient.get(patientId);
            return !!statut && statutsTraites.has(statut);
        };
        const internalUnread = internalRaw.filter((n) => !patientDejaPriseEnCharge(n.patientId, n.createdAt)).length;
        const externalUnread = externalRaw.filter((n) => !patientDejaPriseEnCharge(n.patientId, n.receivedAt)).length;
=======
        const internalUnread = await this.notificationRepo.count({
            where: { statut: notification_cpa_entity_1.StatutNotificationCPA.EN_ATTENTE, lu: false },
        });
        const externalUnread = await this.webhookRepo.count({
            where: { processed: false },
        });
>>>>>>> a733407 (commit 1508)
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
        notification_outgoing_service_1.NotificationOutgoingService,
        notification_back_client_1.NotificationBackClient,
        config_1.ConfigService])
], NotificationCPAService);
//# sourceMappingURL=notification-cpa.service.js.map