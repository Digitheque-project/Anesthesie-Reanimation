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
var CPAService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CPAService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cpa_entity_1 = require("../entities/cpa.entity");
const patient_bloc_entity_1 = require("../entities/patient-bloc.entity");
const premedicament_entity_1 = require("../entities/premedicament.entity");
const accueil_client_1 = require("../external/accueil.client");
const endoscopie_client_1 = require("../external/endoscopie.client");
const notification_outgoing_service_1 = require("../external/notification-outgoing.service");
const demande_cpa_externe_service_1 = require("../demande-cpa-externe/demande-cpa-externe.service");
let CPAService = CPAService_1 = class CPAService {
    cpaRepository;
    patientBlocRepo;
    premedRepository;
    accueilClient;
    endoscopieClient;
    notificationOutgoing;
    demandeCpaExterneService;
    logger = new common_1.Logger(CPAService_1.name);
    constructor(cpaRepository, patientBlocRepo, premedRepository, accueilClient, endoscopieClient, notificationOutgoing, demandeCpaExterneService) {
        this.cpaRepository = cpaRepository;
        this.patientBlocRepo = patientBlocRepo;
        this.premedRepository = premedRepository;
        this.accueilClient = accueilClient;
        this.endoscopieClient = endoscopieClient;
        this.notificationOutgoing = notificationOutgoing;
        this.demandeCpaExterneService = demandeCpaExterneService;
    }
    async create(dto) {
        if (dto.decision === cpa_entity_1.DecisionCPA.INAPTE && (!dto.motifRefus || dto.motifRefus.trim() === '')) {
            throw new common_1.BadRequestException('Le motif du refus est obligatoire lorsque la décision est INAPTE.');
        }
        const { premedicaments, ...cpaData } = dto;
        const cpa = this.cpaRepository.create(cpaData);
        const savedCPA = await this.cpaRepository.save(cpa);
        const saved = Array.isArray(savedCPA) ? savedCPA[0] : savedCPA;
        if (premedicaments?.length) {
            const premeds = premedicaments.map((p) => this.premedRepository.create({ ...p, cpa: saved }));
            await this.premedRepository.save(premeds);
        }
        if (dto.patientId) {
            const nouveauStatut = dto.decision === cpa_entity_1.DecisionCPA.INAPTE
                ? patient_bloc_entity_1.PatientStatut.CPA_INAPTE
                : patient_bloc_entity_1.PatientStatut.CPA_REALISE;
            await this.patientBlocRepo.update(dto.patientId, { statut: nouveauStatut });
            const demande = await this.demandeCpaExterneService.trouverDemandeOuverte(dto.patientId);
            if (demande) {
                const apte = saved.decision === cpa_entity_1.DecisionCPA.APTE;
                await this.demandeCpaExterneService.marquerCpaRealisee(demande, saved.id, apte);
                try {
                    await this.endoscopieClient.notifyCpaResultat(demande, saved.decision, {
                        dateCpa: saved.dateConsultation,
                        observations: saved.notesIncidents,
                    });
                }
                catch (err) {
                    this.logger.error(`Erreur notification Endoscopie: ${err.message}`);
                }
            }
            try {
                const patient = await this.patientBlocRepo.findOne({ where: { patientId: dto.patientId } });
                if (patient?.serviceOrigineId && patient?.serviceOrigine) {
                    await this.notificationOutgoing.notifyOriginService({
                        patientId: dto.patientId,
                        type: dto.decision === cpa_entity_1.DecisionCPA.INAPTE ? 'CPA_INAPTE' : 'CPA_APTE',
                        serviceOrigineId: patient.serviceOrigineId,
                        serviceOrigineName: patient.serviceOrigine,
                        payload: {
                            decision: saved.decision,
                            motifRefus: saved.motifRefus || null,
                            dateCpa: saved.dateConsultation,
                            scoreASA: saved.scoreASA,
                        },
                    });
                }
            }
            catch (err) {
                this.logger.error(`Erreur notification service origine: ${err.message}`);
            }
        }
        return this.findOne(saved.id);
    }
    async findAll(page = 1, limite = 10, patientId) {
        const [data, total] = await this.cpaRepository.findAndCount({
            where: patientId ? { patientId } : {},
            relations: ['anesthesiste', 'premedicaments'],
            skip: (page - 1) * limite, take: limite, order: { createdAt: 'DESC' }
        });
        const enriched = await this.accueilClient.enrichWithIdentity(data);
        return { data: enriched, total, page, pages: Math.ceil(total / limite) };
    }
    async findOne(id) {
        const cpa = await this.cpaRepository.findOne({ where: { id }, relations: ['anesthesiste', 'premedicaments'] });
        if (!cpa)
            throw new common_1.NotFoundException(`CPA ${id} non trouvée`);
        const [enriched] = await this.accueilClient.enrichWithIdentity([cpa]);
        return enriched;
    }
    async update(id, dto) {
        const cpa = await this.cpaRepository.findOne({ where: { id } });
        if (!cpa)
            throw new common_1.NotFoundException(`CPA ${id} non trouvée`);
        Object.assign(cpa, dto);
        return this.cpaRepository.save(cpa);
    }
    async remove(id) {
        const cpa = await this.cpaRepository.findOne({ where: { id } });
        if (!cpa)
            throw new common_1.NotFoundException(`CPA ${id} non trouvée`);
        await this.cpaRepository.delete(id);
        return { message: 'CPA supprimée' };
    }
};
exports.CPAService = CPAService;
exports.CPAService = CPAService = CPAService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cpa_entity_1.CPA)),
    __param(1, (0, typeorm_1.InjectRepository)(patient_bloc_entity_1.PatientBloc)),
    __param(2, (0, typeorm_1.InjectRepository)(premedicament_entity_1.Premedicament)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        accueil_client_1.AccueilClient,
        endoscopie_client_1.EndoscopieClient,
        notification_outgoing_service_1.NotificationOutgoingService,
        demande_cpa_externe_service_1.DemandeCpaExterneService])
], CPAService);
//# sourceMappingURL=cpa.service.js.map