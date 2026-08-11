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
const notification_cpa_entity_1 = require("../entities/notification-cpa.entity");
const premedicament_entity_1 = require("../entities/premedicament.entity");
const accueil_client_1 = require("../external/accueil.client");
const endoscopie_client_1 = require("../external/endoscopie.client");
const notification_outgoing_service_1 = require("../external/notification-outgoing.service");
const demande_cpa_externe_service_1 = require("../demande-cpa-externe/demande-cpa-externe.service");
const medecin_service_1 = require("../medecin/medecin.service");
const medecin_identite_service_1 = require("../medecin/medecin-identite.service");
const patient_bloc_statut_service_1 = require("../patient-bloc/patient-bloc-statut.service");
const service_non_operatoire_1 = require("../patient-bloc/service-non-operatoire");
const role_clinique_1 = require("../central-auth/role-clinique");
const medecin_entity_1 = require("../entities/medecin.entity");
const tracabilite_service_1 = require("../tracabilite/tracabilite.service");
let CPAService = CPAService_1 = class CPAService {
    cpaRepository;
    patientBlocRepo;
    premedRepository;
    notificationCpaRepo;
    accueilClient;
    endoscopieClient;
    notificationOutgoing;
    demandeCpaExterneService;
    medecinService;
    medecinIdentiteService;
    tracabiliteService;
    patientBlocStatutService;
    logger = new common_1.Logger(CPAService_1.name);
    constructor(cpaRepository, patientBlocRepo, premedRepository, notificationCpaRepo, accueilClient, endoscopieClient, notificationOutgoing, demandeCpaExterneService, medecinService, medecinIdentiteService, tracabiliteService, patientBlocStatutService) {
        this.cpaRepository = cpaRepository;
        this.patientBlocRepo = patientBlocRepo;
        this.premedRepository = premedRepository;
        this.notificationCpaRepo = notificationCpaRepo;
        this.accueilClient = accueilClient;
        this.endoscopieClient = endoscopieClient;
        this.notificationOutgoing = notificationOutgoing;
        this.demandeCpaExterneService = demandeCpaExterneService;
        this.medecinService = medecinService;
        this.medecinIdentiteService = medecinIdentiteService;
        this.tracabiliteService = tracabiliteService;
        this.patientBlocStatutService = patientBlocStatutService;
    }
    async create(dto, centralUser) {
        if ((dto.decision === cpa_entity_1.DecisionCPA.INAPTE ||
            dto.decision === cpa_entity_1.DecisionCPA.REPORT) &&
            (!dto.motifRefus || dto.motifRefus.trim() === '')) {
            throw new common_1.BadRequestException(dto.decision === cpa_entity_1.DecisionCPA.INAPTE
                ? 'Le motif du refus est obligatoire lorsque la décision est INAPTE.'
                : 'Le motif du report est obligatoire lorsque la décision est REPORT.');
        }
        const roleUtilisateur = (0, role_clinique_1.matchRoleClinique)(centralUser.role);
        let anesthesisteId;
        if ((0, role_clinique_1.agitCommeAnesthesiste)(roleUtilisateur)) {
            anesthesisteId = centralUser.userId;
        }
        else if (dto.anesthesisteId) {
            const anesthesiste = await this.medecinService.findOne(dto.anesthesisteId);
            if (anesthesiste.role !== medecin_entity_1.RoleMedecin.ANESTHESISTE) {
                throw new common_1.BadRequestException(`${anesthesiste.prenom} ${anesthesiste.nom} n'est pas enregistré(e) comme anesthésiste.`);
            }
            anesthesisteId = anesthesiste.id;
        }
        else {
            anesthesisteId = null;
        }
        const statutValidationProf = (0, role_clinique_1.agitCommeAnesthesiste)(roleUtilisateur)
            ? cpa_entity_1.StatutValidationProf.VALIDE
            : cpa_entity_1.StatutValidationProf.EN_ATTENTE_VALIDATION;
        const { premedicaments, anesthesisteId: _ignored, ...cpaData } = dto;
        const cpa = this.cpaRepository.create({
            ...cpaData,
            anesthesisteId,
            statutValidationProf,
            saisiParId: centralUser.userId,
            saisiParRole: centralUser.role,
        });
        const savedCPA = await this.cpaRepository.save(cpa);
        const saved = Array.isArray(savedCPA) ? savedCPA[0] : savedCPA;
        if (premedicaments?.length) {
            const premeds = premedicaments.map((p) => this.premedRepository.create({ ...p, cpa: saved }));
            await this.premedRepository.save(premeds);
        }
        if (dto.patientId) {
            const nouveauStatut = dto.decision === cpa_entity_1.DecisionCPA.INAPTE
                ? patient_bloc_entity_1.PatientStatut.CPA_INAPTE
                : dto.decision === cpa_entity_1.DecisionCPA.REPORT
                    ? null
                    : patient_bloc_entity_1.PatientStatut.CPA_REALISE;
            if (nouveauStatut) {
                await this.patientBlocStatutService.changerStatut(dto.patientId, nouveauStatut, centralUser.userId);
            }
            if (dto.decision === cpa_entity_1.DecisionCPA.INAPTE ||
                dto.decision === cpa_entity_1.DecisionCPA.REPORT) {
                const patientApresCpa = await this.patientBlocRepo.findOne({
                    where: { patientId: dto.patientId },
                });
                if (patientApresCpa &&
                    patientApresCpa.niveauUrgence === patient_bloc_entity_1.NiveauUrgence.NORMAL &&
                    (0, service_non_operatoire_1.estServiceNonOperatoire)(patientApresCpa.serviceOrigine)) {
                    await this.patientBlocStatutService.archiverRetourServiceOrigine(dto.patientId, centralUser.userId, 'CPA_NON_CONFORME');
                    if (dto.decision === cpa_entity_1.DecisionCPA.REPORT) {
                        const demande = await this.demandeCpaExterneService.trouverDemandeOuverte(dto.patientId);
                        if (demande) {
                            await this.demandeCpaExterneService.marquerReportee(demande);
                        }
                    }
                }
            }
            if (dto.decision !== cpa_entity_1.DecisionCPA.REPORT) {
                await this.notificationCpaRepo.update({
                    patientId: dto.patientId,
                    statut: (0, typeorm_2.In)([
                        notification_cpa_entity_1.StatutNotificationCPA.EN_ATTENTE,
                        notification_cpa_entity_1.StatutNotificationCPA.RDV_PLANIFIE,
                    ]),
                }, { statut: notification_cpa_entity_1.StatutNotificationCPA.REALISE });
            }
            else {
                await this.notificationCpaRepo.update({
                    patientId: dto.patientId,
                    statut: notification_cpa_entity_1.StatutNotificationCPA.EN_ATTENTE,
                    lu: false,
                }, { lu: true, luLe: new Date() });
            }
            const demande = await this.demandeCpaExterneService.trouverDemandeOuverte(dto.patientId);
            if (nouveauStatut === patient_bloc_entity_1.PatientStatut.CPA_REALISE) {
                const patientApresCpa = await this.patientBlocRepo.findOne({
                    where: { patientId: dto.patientId },
                });
                if (patientApresCpa?.niveauUrgence === patient_bloc_entity_1.NiveauUrgence.URGENT ||
                    patientApresCpa?.niveauUrgence === patient_bloc_entity_1.NiveauUrgence.TRES_URGENT) {
                    await this.patientBlocStatutService.changerStatut(dto.patientId, patient_bloc_entity_1.PatientStatut.PRET_POUR_BLOC, centralUser.userId);
                }
                else if (statutValidationProf === cpa_entity_1.StatutValidationProf.VALIDE &&
                    Array.isArray(dto.medicamentsAnesthesieReanimation) &&
                    dto.medicamentsAnesthesieReanimation.length > 0) {
                    await this.patientBlocStatutService.changerStatut(dto.patientId, patient_bloc_entity_1.PatientStatut.EN_ATTENTE_VERIFICATION_VEILLE, centralUser.userId);
                }
            }
            if (demande && dto.decision !== cpa_entity_1.DecisionCPA.REPORT) {
                const apte = saved.decision === cpa_entity_1.DecisionCPA.APTE;
                await this.demandeCpaExterneService.marquerCpaRealisee(demande, saved.id, apte);
                try {
                    await this.demandeCpaExterneService.notifierResultat(demande, 'CPA_RESULTAT', {
                        decision: saved.decision,
                        decisionOperation: saved.decisionOperation,
                        dateCpa: saved.dateConsultation,
                        observations: saved.notesIncidents,
                        motifRefus: saved.motifRefus,
                    });
                    if (!demande.sourceCallbackUrl) {
                        await this.endoscopieClient.notifyCpaResultat(demande, saved.decision, {
                            dateCpa: saved.dateConsultation,
                            observations: saved.notesIncidents,
                        });
                    }
                }
                catch (err) {
                    this.logger.error(`Erreur notification résultat CPA au service demandeur: ${err.message}`);
                }
            }
            else if (demande && dto.decision === cpa_entity_1.DecisionCPA.REPORT) {
                try {
                    await this.demandeCpaExterneService.notifierResultat(demande, 'CPA_REPORT', {
                        motifRefus: saved.motifRefus,
                        dateReport: saved.dateVerificationVeille,
                    });
                }
                catch (err) {
                    this.logger.error(`Erreur notification report CPA au service demandeur: ${err.message}`);
                }
            }
            try {
                const patient = await this.patientBlocRepo.findOne({
                    where: { patientId: dto.patientId },
                });
                if (patient?.serviceOrigineId && patient?.serviceOrigine) {
                    await this.notificationOutgoing.notifyOriginService({
                        patientId: dto.patientId,
                        type: dto.decision === cpa_entity_1.DecisionCPA.INAPTE
                            ? 'CPA_INAPTE'
                            : dto.decision === cpa_entity_1.DecisionCPA.REPORT
                                ? 'CPA_REPORT'
                                : 'CPA_APTE',
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
        await this.tracabiliteService.log('CPA', saved.id, 'CREATE', { patientId: dto.patientId, decision: dto.decision }, centralUser.userId);
        return this.findOne(saved.id);
    }
    async findAll(page = 1, limite = 10, patientId) {
        const [data, total] = await this.cpaRepository.findAndCount({
            where: patientId ? { patientId } : {},
            relations: ['premedicaments'],
            skip: (page - 1) * limite,
            take: limite,
            order: { createdAt: 'DESC' },
        });
        const enrichedPatient = await this.accueilClient.enrichWithIdentity(data);
        const enriched = await this.medecinIdentiteService.enrichir(enrichedPatient, 'anesthesisteId', 'anesthesiste');
        return { data: enriched, total, page, pages: Math.ceil(total / limite) };
    }
    async findOne(id) {
        const cpa = await this.cpaRepository.findOne({
            where: { id },
            relations: ['premedicaments'],
        });
        if (!cpa)
            throw new common_1.NotFoundException(`CPA ${id} non trouvée`);
        const [enrichedPatient] = await this.accueilClient.enrichWithIdentity([
            cpa,
        ]);
        const [enriched] = await this.medecinIdentiteService.enrichir([enrichedPatient], 'anesthesisteId', 'anesthesiste');
        return enriched;
    }
    async update(id, dto, centralUser) {
        const cpa = await this.cpaRepository.findOne({ where: { id } });
        if (!cpa)
            throw new common_1.NotFoundException(`CPA ${id} non trouvée`);
        Object.assign(cpa, dto);
        const roleUtilisateur = centralUser
            ? (0, role_clinique_1.matchRoleClinique)(centralUser.role)
            : null;
        const contientSuiviAnesthesiste = dto.medicamentsAnesthesieReanimation !== undefined ||
            dto.dateVerificationVeille !== undefined;
        if (cpa.statutValidationProf === cpa_entity_1.StatutValidationProf.EN_ATTENTE_VALIDATION &&
            (0, role_clinique_1.agitCommeAnesthesiste)(roleUtilisateur) &&
            (cpa.decision !== cpa_entity_1.DecisionCPA.APTE || contientSuiviAnesthesiste)) {
            cpa.statutValidationProf = cpa_entity_1.StatutValidationProf.VALIDE;
        }
        const patientApresCpa = cpa.patientId
            ? await this.patientBlocRepo.findOne({
                where: { patientId: cpa.patientId },
            })
            : null;
        if (patientApresCpa?.statut === patient_bloc_entity_1.PatientStatut.CPA_REALISE &&
            cpa.decision === cpa_entity_1.DecisionCPA.APTE &&
            (0, role_clinique_1.agitCommeAnesthesiste)(roleUtilisateur) &&
            contientSuiviAnesthesiste) {
            await this.patientBlocStatutService.changerStatut(cpa.patientId, patient_bloc_entity_1.PatientStatut.EN_ATTENTE_VERIFICATION_VEILLE, centralUser?.userId);
        }
        const updated = await this.cpaRepository.save(cpa);
        await this.tracabiliteService.log('CPA', id, 'UPDATE', { patientId: cpa.patientId }, centralUser?.userId);
        return updated;
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
    __param(3, (0, typeorm_1.InjectRepository)(notification_cpa_entity_1.NotificationCPA)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        accueil_client_1.AccueilClient,
        endoscopie_client_1.EndoscopieClient,
        notification_outgoing_service_1.NotificationOutgoingService,
        demande_cpa_externe_service_1.DemandeCpaExterneService,
        medecin_service_1.MedecinService,
        medecin_identite_service_1.MedecinIdentiteService,
        tracabilite_service_1.TracabiliteService,
        patient_bloc_statut_service_1.PatientBlocStatutService])
], CPAService);
//# sourceMappingURL=cpa.service.js.map