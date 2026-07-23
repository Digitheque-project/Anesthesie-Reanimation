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
var DemandeCpaExterneService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemandeCpaExterneService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const typeorm_2 = require("typeorm");
const demande_cpa_externe_entity_1 = require("../entities/demande-cpa-externe.entity");
const creneau_bloc_entity_1 = require("../entities/creneau-bloc.entity");
const notification_back_client_1 = require("../external/notification-back.client");
const accueil_client_1 = require("../external/accueil.client");
let DemandeCpaExterneService = DemandeCpaExterneService_1 = class DemandeCpaExterneService {
    repo;
    creneauRepo;
    config;
    http;
    notificationBackClient;
    accueilClient;
    logger = new common_1.Logger(DemandeCpaExterneService_1.name);
    blocServiceId;
    constructor(repo, creneauRepo, config, http, notificationBackClient, accueilClient) {
        this.repo = repo;
        this.creneauRepo = creneauRepo;
        this.config = config;
        this.http = http;
        this.notificationBackClient = notificationBackClient;
        this.accueilClient = accueilClient;
        this.blocServiceId = this.config.get('externalServices.serviceId') ?? '';
    }
    async receive(dto) {
        const demande = this.repo.create({
            ...dto,
            dateExamenSouhaitee: dto.dateExamenSouhaitee ? new Date(dto.dateExamenSouhaitee) : undefined,
            chuId: this.config.get('externalServices.chuId'),
            statut: demande_cpa_externe_entity_1.StatutDemandeCpaExterne.EN_ATTENTE,
            payload: dto,
        });
        const saved = await this.repo.save(demande);
        this.logger.log(`📋 Demande de CPA externe reçue pour patient ${dto.patientId} (source: ${dto.sourceServiceName || dto.sourceServiceId})`);
        const estUrgent = (dto.urgence ?? 0) >= 4;
        await this.notificationBackClient.notifyService({
            serviceId: this.blocServiceId,
            title: estUrgent ? '🔴 Demande de CPA externe urgente' : '📋 Nouvelle demande de CPA externe',
            message: `${dto.motif || dto.typeAnesthesie} — patient ${dto.patientId} (${dto.sourceServiceName || dto.sourceServiceId})`,
            type: 'new_demande_cpa_externe',
            source: 'bloc-operatoire',
            data: { patientId: dto.patientId, demandeId: saved.id, urgence: dto.urgence },
        });
        return saved;
    }
    async findAll(statut) {
        const demandes = await this.repo.find({ where: statut ? { statut } : {}, order: { createdAt: 'DESC' } });
        try {
            return await this.accueilClient.enrichWithIdentity(demandes);
        }
        catch {
            return demandes;
        }
    }
    async findOne(id) {
        const demande = await this.repo.findOne({ where: { id } });
        if (!demande)
            throw new common_1.NotFoundException(`Demande de CPA externe ${id} non trouvée`);
        try {
            return await this.accueilClient.enrichWithIdentity(demande);
        }
        catch {
            return demande;
        }
    }
    async update(id, dto) {
        const demande = await this.findOne(id);
        Object.assign(demande, {
            ...dto,
            dateCpaPlanifiee: dto.dateCpaPlanifiee ? new Date(dto.dateCpaPlanifiee) : demande.dateCpaPlanifiee,
            dateVpaPlanifiee: dto.dateVpaPlanifiee ? new Date(dto.dateVpaPlanifiee) : demande.dateVpaPlanifiee,
        });
        return this.repo.save(demande);
    }
    async planifier(id, dto) {
        const demande = await this.findOne(id);
        const type = dto.type ?? creneau_bloc_entity_1.TypeRDV.CPA;
        const creneau = this.creneauRepo.create({
            date: dto.date,
            heureDebut: dto.heureDebut,
            heureFin: dto.heureFin,
            salle: dto.salle,
            patientId: demande.patientId,
            chirurgienId: dto.chirurgienId ?? null,
            responsable: dto.responsable ?? null,
            type,
            estUrgence: (demande.urgence ?? 0) >= 4,
        });
        await this.creneauRepo.save(creneau);
        if (type === creneau_bloc_entity_1.TypeRDV.VERIFICATION_VEILLE) {
            demande.statut = demande_cpa_externe_entity_1.StatutDemandeCpaExterne.VPA_PLANIFIEE;
            demande.dateVpaPlanifiee = new Date(dto.date);
        }
        else {
            demande.statut = demande_cpa_externe_entity_1.StatutDemandeCpaExterne.CPA_PLANIFIEE;
            demande.dateCpaPlanifiee = new Date(dto.date);
        }
        return this.repo.save(demande);
    }
    async trouverDemandeOuverte(patientId) {
        return this.repo.findOne({
            where: {
                patientId,
                statut: (0, typeorm_2.In)([demande_cpa_externe_entity_1.StatutDemandeCpaExterne.EN_ATTENTE, demande_cpa_externe_entity_1.StatutDemandeCpaExterne.CPA_PLANIFIEE, demande_cpa_externe_entity_1.StatutDemandeCpaExterne.VPA_PLANIFIEE, demande_cpa_externe_entity_1.StatutDemandeCpaExterne.CPA_REALISEE]),
            },
            order: { createdAt: 'DESC' },
        });
    }
    async marquerCpaRealisee(demande, cpaId, apte) {
        demande.cpaId = cpaId;
        demande.statut = apte ? demande_cpa_externe_entity_1.StatutDemandeCpaExterne.CPA_REALISEE : demande_cpa_externe_entity_1.StatutDemandeCpaExterne.REPORTEE;
        return this.repo.save(demande);
    }
    async marquerVpaRealisee(demande, vpaId) {
        demande.vpaId = vpaId;
        demande.statut = demande_cpa_externe_entity_1.StatutDemandeCpaExterne.CONFIRMEE;
        return this.repo.save(demande);
    }
    async notifierResultat(demande, type, payload) {
        try {
            await this.notificationBackClient.notifyService({
                serviceId: demande.sourceServiceId,
                title: type === 'CPA_RESULTAT' ? '✅ Résultat de votre demande de CPA disponible' : '✅ Vérification veille réalisée',
                message: `Résultat disponible pour le patient ${demande.patientId} (réf. ${demande.sourceReferenceId})`,
                type: type === 'CPA_RESULTAT' ? 'demande_cpa_resultat' : 'demande_vpa_resultat',
                source: 'bloc-operatoire',
                data: { patientId: demande.patientId, demandeId: demande.id, entiteRefType: demande.sourceReferenceType, entiteRefId: demande.sourceReferenceId, ...payload },
            });
        }
        catch (err) {
            this.logger.error(`❌ Échec notification temps réel du résultat à ${demande.sourceServiceName || demande.sourceServiceId}: ${err.message}`);
        }
        if (!demande.sourceCallbackUrl)
            return;
        try {
            await (0, rxjs_1.firstValueFrom)(this.http.post(demande.sourceCallbackUrl, {
                type,
                motif: `Résultat demande CPA/VPA pour patient ${demande.patientId}`,
                patientId: demande.patientId,
                entiteRefType: demande.sourceReferenceType,
                entiteRefId: demande.sourceReferenceId,
                emitter: this.blocServiceId,
                emitterName: 'Bloc Opératoire',
                recipient: demande.sourceServiceId,
                recipientName: demande.sourceServiceName,
                payload,
                createdAt: new Date().toISOString(),
            }));
            this.logger.log(`✅ Résultat "${type}" renvoyé à ${demande.sourceServiceName || demande.sourceServiceId} pour patient ${demande.patientId}`);
        }
        catch (err) {
            this.logger.error(`❌ Échec envoi résultat "${type}" à ${demande.sourceServiceName || demande.sourceServiceId}: ${err.message}`);
        }
    }
    async findStatutPublic(id) {
        const demande = await this.findOne(id);
        return {
            id: demande.id,
            patientId: demande.patientId,
            sourceReferenceId: demande.sourceReferenceId,
            statut: demande.statut,
            cpaId: demande.cpaId || null,
            vpaId: demande.vpaId || null,
            dateCpaPlanifiee: demande.dateCpaPlanifiee || null,
            dateVpaPlanifiee: demande.dateVpaPlanifiee || null,
        };
    }
};
exports.DemandeCpaExterneService = DemandeCpaExterneService;
exports.DemandeCpaExterneService = DemandeCpaExterneService = DemandeCpaExterneService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(demande_cpa_externe_entity_1.DemandeCpaExterne)),
    __param(1, (0, typeorm_1.InjectRepository)(creneau_bloc_entity_1.CreneauBloc)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService,
        axios_1.HttpService,
        notification_back_client_1.NotificationBackClient,
        accueil_client_1.AccueilClient])
], DemandeCpaExterneService);
//# sourceMappingURL=demande-cpa-externe.service.js.map