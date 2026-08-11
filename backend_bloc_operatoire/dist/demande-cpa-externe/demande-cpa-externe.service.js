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
const cpa_entity_1 = require("../entities/cpa.entity");
const patient_bloc_entity_1 = require("../entities/patient-bloc.entity");
const notification_back_client_1 = require("../external/notification-back.client");
const accueil_client_1 = require("../external/accueil.client");
const patient_bloc_service_1 = require("../patient-bloc/patient-bloc.service");
const service_registry_client_1 = require("../external/service-registry.client");
const creneau_validation_util_1 = require("../planning/creneau-validation.util");
let DemandeCpaExterneService = DemandeCpaExterneService_1 = class DemandeCpaExterneService {
    repo;
    creneauRepo;
    cpaRepo;
    patientBlocRepo;
    config;
    http;
    notificationBackClient;
    accueilClient;
    patientBlocService;
    serviceRegistryClient;
    logger = new common_1.Logger(DemandeCpaExterneService_1.name);
    blocServiceId;
    constructor(repo, creneauRepo, cpaRepo, patientBlocRepo, config, http, notificationBackClient, accueilClient, patientBlocService, serviceRegistryClient) {
        this.repo = repo;
        this.creneauRepo = creneauRepo;
        this.cpaRepo = cpaRepo;
        this.patientBlocRepo = patientBlocRepo;
        this.config = config;
        this.http = http;
        this.notificationBackClient = notificationBackClient;
        this.accueilClient = accueilClient;
        this.patientBlocService = patientBlocService;
        this.serviceRegistryClient = serviceRegistryClient;
        this.blocServiceId =
            this.config.get('externalServices.serviceId') ?? '';
    }
    async receive(dto) {
        const sourceServiceName = (await this.serviceRegistryClient.getServiceName(dto.sourceServiceId)) ||
            dto.sourceServiceName;
        const demande = this.repo.create({
            ...dto,
            sourceServiceName,
            dateExamenSouhaitee: dto.dateExamenSouhaitee
                ? new Date(dto.dateExamenSouhaitee)
                : undefined,
            chuId: this.config.get('externalServices.chuId'),
            statut: demande_cpa_externe_entity_1.StatutDemandeCpaExterne.EN_ATTENTE,
            payload: dto,
        });
        const saved = await this.repo.save(demande);
        this.logger.log(`📋 Demande de CPA externe reçue pour patient ${dto.patientId} (source: ${dto.sourceServiceName || dto.sourceServiceId})`);
        try {
            await this.patientBlocService.creerDepuisPrescription(saved.id);
        }
        catch (err) {
            this.logger.error(`❌ Échec création PatientBloc depuis la demande CPA externe ${saved.id}: ${err.message}`);
        }
        const estUrgent = (dto.urgence ?? 0) >= 4;
        await this.notificationBackClient.notifyService({
            serviceId: this.blocServiceId,
            title: estUrgent
                ? '🔴 Demande de CPA externe urgente'
                : '📋 Nouvelle demande de CPA externe',
            message: `${dto.motif || dto.typeAnesthesie} — patient ${dto.patientId} (${dto.sourceServiceName || dto.sourceServiceId})`,
            type: 'new_demande_cpa_externe',
            source: 'bloc-operatoire',
            data: {
                patientId: dto.patientId,
                demandeId: saved.id,
                urgence: dto.urgence,
            },
        });
        return saved;
    }
    async findAll(statut, patientId) {
        const where = {};
        if (statut)
            where.statut = statut;
        if (patientId)
            where.patientId = patientId;
        const demandes = await this.repo.find({
            where,
            order: { createdAt: 'DESC' },
        });
        const ids = Array.from(new Set(demandes.map((d) => d.patientId).filter(Boolean)));
        const [patients, cpas] = await Promise.all([
            ids.length
                ? this.patientBlocRepo.find({ where: { patientId: (0, typeorm_2.In)(ids) } })
                : [],
            ids.length ? this.cpaRepo.find({ where: { patientId: (0, typeorm_2.In)(ids) } }) : [],
        ]);
        const patientMap = new Map(patients.map((p) => [p.patientId, p]));
        const derniereCpaParPatient = new Map();
        for (const c of cpas) {
            const existante = derniereCpaParPatient.get(c.patientId);
            if (!existante ||
                new Date(c.dateConsultation) > new Date(existante.dateConsultation)) {
                derniereCpaParPatient.set(c.patientId, c);
            }
        }
        const cpaTraitee = (c) => !!c &&
            ['APTE', 'INAPTE'].includes(c.decision) &&
            c.decisionOperation !== 'REPORTEE';
        const enrichies = demandes.map((d) => {
            const pb = patientMap.get(d.patientId);
            const derniereCpa = derniereCpaParPatient.get(d.patientId);
            return {
                ...d,
                patient: {
                    id: d.patientId,
                    statut: pb?.statut ?? null,
                    niveauUrgence: pb?.niveauUrgence ?? null,
                    dateIntervention: pb?.dateIntervention ?? null,
                },
                cpaFinaleRealisee: cpaTraitee(derniereCpa),
            };
        });
        let resultat = enrichies;
        if (statut === demande_cpa_externe_entity_1.StatutDemandeCpaExterne.EN_ATTENTE) {
            resultat = enrichies.filter((d) => {
                if (d.patient?.statut && d.patient.statut !== patient_bloc_entity_1.PatientStatut.EN_ATTENTE_CPA) {
                    return false;
                }
                if (d.cpaFinaleRealisee)
                    return false;
                return true;
            });
        }
        try {
            return await this.accueilClient.enrichWithIdentity(resultat);
        }
        catch {
            return resultat;
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
        const aujourdhui = new Date().toISOString().split('T')[0];
        for (const champ of ['dateCpaPlanifiee', 'dateVpaPlanifiee']) {
            const valeur = dto[champ];
            if (valeur && new Date(valeur).toISOString().split('T')[0] < aujourdhui) {
                throw new common_1.BadRequestException('Impossible de planifier un rendez-vous à une date passée.');
            }
        }
        const demande = await this.findOne(id);
        Object.assign(demande, {
            ...dto,
            dateCpaPlanifiee: dto.dateCpaPlanifiee
                ? new Date(dto.dateCpaPlanifiee)
                : demande.dateCpaPlanifiee,
            dateVpaPlanifiee: dto.dateVpaPlanifiee
                ? new Date(dto.dateVpaPlanifiee)
                : demande.dateVpaPlanifiee,
        });
        return this.repo.save(demande);
    }
    async planifier(id, dto) {
        await (0, creneau_validation_util_1.verifierCreneauValide)(this.creneauRepo, dto.date, dto.heureDebut);
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
        const saved = await this.repo.save(demande);
        this.notificationBackClient
            .notifyService({
            serviceId: this.blocServiceId,
            title: 'Demande CPA externe planifiée',
            message: `Demande ${id} planifiée`,
            type: 'patient_statut_change',
            source: 'bloc-operatoire',
            data: { demandeId: id, patientId: demande.patientId },
        })
            .catch(() => { });
        return saved;
    }
    async trouverDemandeOuverte(patientId) {
        return this.repo.findOne({
            where: {
                patientId,
                statut: (0, typeorm_2.In)([
                    demande_cpa_externe_entity_1.StatutDemandeCpaExterne.EN_ATTENTE,
                    demande_cpa_externe_entity_1.StatutDemandeCpaExterne.CPA_PLANIFIEE,
                    demande_cpa_externe_entity_1.StatutDemandeCpaExterne.VPA_PLANIFIEE,
                    demande_cpa_externe_entity_1.StatutDemandeCpaExterne.CPA_REALISEE,
                ]),
            },
            order: { createdAt: 'DESC' },
        });
    }
    async marquerLu(id) {
        const demande = await this.findOne(id);
        demande.lu = true;
        demande.luLe = new Date();
        return this.repo.save(demande);
    }
    async marquerCpaRealisee(demande, cpaId, apte) {
        demande.cpaId = cpaId;
        demande.statut = demande_cpa_externe_entity_1.StatutDemandeCpaExterne.CPA_REALISEE;
        return this.repo.save(demande);
    }
    async marquerVpaRealisee(demande, vpaId) {
        demande.vpaId = vpaId;
        demande.statut = demande_cpa_externe_entity_1.StatutDemandeCpaExterne.CONFIRMEE;
        return this.repo.save(demande);
    }
    async marquerReportee(demande) {
        demande.statut = demande_cpa_externe_entity_1.StatutDemandeCpaExterne.REPORTEE;
        return this.repo.save(demande);
    }
    async notifierResultat(demande, type, payload) {
        try {
            await this.notificationBackClient.notifyService({
                serviceId: demande.sourceServiceId,
                title: type === 'CPA_RESULTAT'
                    ? '✅ Résultat de votre demande de CPA disponible'
                    : '✅ Vérification veille réalisée',
                message: `Résultat disponible pour le patient ${demande.patientId} (réf. ${demande.sourceReferenceId})`,
                type: type === 'CPA_RESULTAT'
                    ? 'demande_cpa_resultat'
                    : 'demande_vpa_resultat',
                source: 'bloc-operatoire',
                data: {
                    patientId: demande.patientId,
                    demandeId: demande.id,
                    entiteRefType: demande.sourceReferenceType,
                    entiteRefId: demande.sourceReferenceId,
                    ...payload,
                },
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
        let decision = null;
        let dateCpa = null;
        let observations = null;
        let motifRefus = null;
        if (demande.cpaId) {
            const cpa = await this.cpaRepo.findOne({ where: { id: demande.cpaId } });
            if (cpa) {
                decision = cpa.decision;
                dateCpa = cpa.dateConsultation;
                observations = cpa.notesIncidents || null;
                motifRefus = cpa.motifRefus || null;
            }
        }
        return {
            id: demande.id,
            patientId: demande.patientId,
            sourceReferenceId: demande.sourceReferenceId,
            statut: demande.statut,
            cpaId: demande.cpaId || null,
            vpaId: demande.vpaId || null,
            dateCpaPlanifiee: demande.dateCpaPlanifiee || null,
            dateVpaPlanifiee: demande.dateVpaPlanifiee || null,
            decision,
            dateCpa,
            observations,
            motifRefus,
        };
    }
};
exports.DemandeCpaExterneService = DemandeCpaExterneService;
exports.DemandeCpaExterneService = DemandeCpaExterneService = DemandeCpaExterneService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(demande_cpa_externe_entity_1.DemandeCpaExterne)),
    __param(1, (0, typeorm_1.InjectRepository)(creneau_bloc_entity_1.CreneauBloc)),
    __param(2, (0, typeorm_1.InjectRepository)(cpa_entity_1.CPA)),
    __param(3, (0, typeorm_1.InjectRepository)(patient_bloc_entity_1.PatientBloc)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService,
        axios_1.HttpService,
        notification_back_client_1.NotificationBackClient,
        accueil_client_1.AccueilClient,
        patient_bloc_service_1.PatientBlocService,
        service_registry_client_1.ServiceRegistryClient])
], DemandeCpaExterneService);
//# sourceMappingURL=demande-cpa-externe.service.js.map