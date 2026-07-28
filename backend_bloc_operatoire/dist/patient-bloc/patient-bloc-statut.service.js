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
var PatientBlocStatutService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientBlocStatutService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const patient_bloc_entity_1 = require("../entities/patient-bloc.entity");
const notification_outgoing_service_1 = require("../external/notification-outgoing.service");
const tracabilite_service_1 = require("../tracabilite/tracabilite.service");
let PatientBlocStatutService = PatientBlocStatutService_1 = class PatientBlocStatutService {
    patientBlocRepo;
    notificationOutgoing;
    tracabiliteService;
    logger = new common_1.Logger(PatientBlocStatutService_1.name);
    constructor(patientBlocRepo, notificationOutgoing, tracabiliteService) {
        this.patientBlocRepo = patientBlocRepo;
        this.notificationOutgoing = notificationOutgoing;
        this.tracabiliteService = tracabiliteService;
    }
    async changerStatut(patientId, nouveauStatut, utilisateurId) {
        const patient = await this.patientBlocRepo.findOne({
            where: { patientId },
        });
        if (!patient)
            throw new common_1.NotFoundException(`Patient ${patientId} non trouvé`);
        const ancienStatut = patient.statut;
        const transitionsValides = {
            [patient_bloc_entity_1.PatientStatut.EN_ATTENTE_CPA]: [
                patient_bloc_entity_1.PatientStatut.CPA_REALISE,
                patient_bloc_entity_1.PatientStatut.CPA_INAPTE,
            ],
            [patient_bloc_entity_1.PatientStatut.CPA_REALISE]: [
                patient_bloc_entity_1.PatientStatut.EN_ATTENTE_VERIFICATION_VEILLE,
                patient_bloc_entity_1.PatientStatut.PRET_POUR_BLOC,
            ],
            [patient_bloc_entity_1.PatientStatut.CPA_INAPTE]: [],
            [patient_bloc_entity_1.PatientStatut.EN_ATTENTE_VERIFICATION_VEILLE]: [
                patient_bloc_entity_1.PatientStatut.VERIFICATION_VEILLE_REALISEE,
            ],
            [patient_bloc_entity_1.PatientStatut.VERIFICATION_VEILLE_REALISEE]: [
                patient_bloc_entity_1.PatientStatut.PRET_POUR_BLOC,
            ],
            [patient_bloc_entity_1.PatientStatut.PRET_POUR_BLOC]: [patient_bloc_entity_1.PatientStatut.EN_COURS_OPERATION],
            [patient_bloc_entity_1.PatientStatut.EN_COURS_OPERATION]: [patient_bloc_entity_1.PatientStatut.EN_SALLE_REVEIL],
            [patient_bloc_entity_1.PatientStatut.EN_SALLE_REVEIL]: [patient_bloc_entity_1.PatientStatut.SORTI],
            [patient_bloc_entity_1.PatientStatut.SORTI]: [],
        };
        const autorise = transitionsValides[patient.statut]?.includes(nouveauStatut);
        if (!autorise)
            throw new common_1.ConflictException(`Transition invalide : ${patient.statut} → ${nouveauStatut}`);
        patient.statut = nouveauStatut;
        const saved = await this.patientBlocRepo.save(patient);
        await this.tracabiliteService.log('PatientBloc', patientId, 'STATUT_CHANGE', { ancienStatut, nouveauStatut }, utilisateurId);
        return saved;
    }
    async avancerVersEnCoursOperation(patientId, utilisateurId) {
        const patient = await this.patientBlocRepo.findOne({
            where: { patientId },
        });
        if (!patient)
            return;
        if (patient.statut === patient_bloc_entity_1.PatientStatut.VERIFICATION_VEILLE_REALISEE) {
            await this.changerStatut(patientId, patient_bloc_entity_1.PatientStatut.PRET_POUR_BLOC, utilisateurId);
            await this.changerStatut(patientId, patient_bloc_entity_1.PatientStatut.EN_COURS_OPERATION, utilisateurId);
        }
        else if (patient.statut === patient_bloc_entity_1.PatientStatut.PRET_POUR_BLOC) {
            await this.changerStatut(patientId, patient_bloc_entity_1.PatientStatut.EN_COURS_OPERATION, utilisateurId);
        }
    }
    async marquerApteCpa(patientId, utilisateurId) {
        const patient = await this.patientBlocRepo.findOne({
            where: { patientId },
        });
        if (!patient)
            throw new common_1.NotFoundException(`Patient ${patientId} non trouvé`);
        if (patient.statut === patient_bloc_entity_1.PatientStatut.CPA_INAPTE) {
            patient.statut = patient_bloc_entity_1.PatientStatut.EN_ATTENTE_CPA;
            patient.motifRefusCpa = null;
            await this.patientBlocRepo.save(patient);
            await this.tracabiliteService.log('PatientBloc', patientId, 'STATUT_CHANGE', { ancienStatut: patient_bloc_entity_1.PatientStatut.CPA_INAPTE, nouveauStatut: patient_bloc_entity_1.PatientStatut.EN_ATTENTE_CPA }, utilisateurId);
        }
        return patient;
    }
    async marquerInapteCpa(patientId, motifRefus, utilisateurId) {
        if (!motifRefus || !motifRefus.trim()) {
            throw new common_1.BadRequestException('Le motif du refus est obligatoire.');
        }
        const patient = await this.changerStatut(patientId, patient_bloc_entity_1.PatientStatut.CPA_INAPTE, utilisateurId);
        patient.motifRefusCpa = motifRefus.trim();
        await this.patientBlocRepo.save(patient);
        try {
            if (patient.serviceOrigineId && patient.serviceOrigine) {
                await this.notificationOutgoing.notifyOriginService({
                    patientId,
                    type: 'CPA_INAPTE',
                    serviceOrigineId: patient.serviceOrigineId,
                    serviceOrigineName: patient.serviceOrigine,
                    payload: { motifRefus: patient.motifRefusCpa },
                });
            }
        }
        catch (err) {
            this.logger.error(`Erreur notification service origine après refus CPA: ${err.message}`);
        }
        return patient;
    }
    async modifierDateIntervention(patientId, dateIntervention, utilisateurId) {
        const patient = await this.patientBlocRepo.findOne({
            where: { patientId },
        });
        if (!patient)
            throw new common_1.NotFoundException(`Patient ${patientId} non trouvé`);
        const ancienneDate = patient.dateIntervention;
        patient.dateIntervention = new Date(dateIntervention);
        const saved = await this.patientBlocRepo.save(patient);
        await this.tracabiliteService.log('PatientBloc', patientId, 'UPDATE', { champ: 'dateIntervention', ancienneValeur: ancienneDate, nouvelleValeur: patient.dateIntervention }, utilisateurId);
        return saved;
    }
};
exports.PatientBlocStatutService = PatientBlocStatutService;
exports.PatientBlocStatutService = PatientBlocStatutService = PatientBlocStatutService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(patient_bloc_entity_1.PatientBloc)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        notification_outgoing_service_1.NotificationOutgoingService,
        tracabilite_service_1.TracabiliteService])
], PatientBlocStatutService);
//# sourceMappingURL=patient-bloc-statut.service.js.map