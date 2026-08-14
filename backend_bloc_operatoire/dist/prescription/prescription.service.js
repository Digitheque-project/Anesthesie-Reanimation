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
var PrescriptionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const config_1 = require("@nestjs/config");
const typeorm_2 = require("typeorm");
const patient_bloc_entity_1 = require("../entities/patient-bloc.entity");
const notification_cpa_entity_1 = require("../entities/notification-cpa.entity");
const prescription_externe_client_1 = require("../external/prescription-externe.client");
const notification_back_client_1 = require("../external/notification-back.client");
const service_registry_client_1 = require("../external/service-registry.client");
const ingestion_ledger_service_1 = require("../ingestion/ingestion-ledger.service");
const ingestion_externe_entity_1 = require("../entities/ingestion-externe.entity");
const urgence_1 = require("../common/urgence");
const id_dossier_1 = require("../common/id-dossier");
let PrescriptionService = PrescriptionService_1 = class PrescriptionService {
    patientBlocRepo;
    notificationRepo;
    prescriptionClient;
    notificationBackClient;
    serviceRegistryClient;
    ingestionLedger;
    config;
    logger = new common_1.Logger(PrescriptionService_1.name);
    polling = false;
    dernierPoll = 0;
    constructor(patientBlocRepo, notificationRepo, prescriptionClient, notificationBackClient, serviceRegistryClient, ingestionLedger, config) {
        this.patientBlocRepo = patientBlocRepo;
        this.notificationRepo = notificationRepo;
        this.prescriptionClient = prescriptionClient;
        this.notificationBackClient = notificationBackClient;
        this.serviceRegistryClient = serviceRegistryClient;
        this.ingestionLedger = ingestionLedger;
        this.config = config;
    }
    async processPrescription(dto) {
        this.logger.log(`📦 Notification de prescription reçue (type ${dto.type}, patient ${dto.patientId}) — synchronisation immédiate`);
        this.pollPrescriptionsBloc().catch((err) => this.logger.error(`Erreur lors de la synchronisation déclenchée par webhook: ${err.message}`));
        return true;
    }
    async pollPrescriptionsBloc() {
        if (this.polling)
            return;
        const maintenant = Date.now();
        if (maintenant - this.dernierPoll < 5000)
            return;
        this.dernierPoll = maintenant;
        const serviceId = this.config.get('externalServices.serviceId');
        if (!serviceId)
            return;
        this.polling = true;
        try {
            const prescriptions = await this.prescriptionClient.getPrescriptionsBloc(serviceId);
            for (const p of prescriptions) {
                try {
                    await this.ingerer(p, serviceId);
                }
                catch (err) {
                    this.logger.error(`Erreur ingestion prescription ${p.id}: ${err.message}`);
                }
            }
        }
        finally {
            this.polling = false;
        }
    }
    extraireDateIntervention(p, acte) {
        const source = acte?.dateIntervention ?? p.dateIntervention;
        if (!source)
            return undefined;
        const base = new Date(source);
        if (isNaN(base.getTime()))
            return undefined;
        const heure = acte?.heureIntervention;
        const [h, m] = (heure || '').split(':').map(Number);
        if (isNaN(h))
            return base;
        return new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(), h, isNaN(m) ? 0 : m, 0, 0));
    }
    libelleComplet(actes) {
        const libelles = actes
            .map((a) => (a?.libelle || '').trim())
            .filter((l) => l !== '');
        return Array.from(new Set(libelles)).join(' + ');
    }
    async ingerer(p, serviceId) {
        if (await this.ingestionLedger.dejaIngeree(ingestion_externe_entity_1.CanalIngestion.PRESCRIPTION_BLOC, p.id)) {
            await this.prescriptionClient.updateStatut(p.id, 'RECU_BLOC');
            return;
        }
        let patient = await this.patientBlocRepo.findOne({
            where: { patientId: p.patientId },
        });
        const episodeTermine = [
            patient_bloc_entity_1.PatientStatut.SORTI,
            patient_bloc_entity_1.PatientStatut.CPA_INAPTE,
        ];
        const retourPatient = !!patient && episodeTermine.includes(patient.statut);
        const enCoursOperation = [
            patient_bloc_entity_1.PatientStatut.EN_COURS_OPERATION,
            patient_bloc_entity_1.PatientStatut.EN_SALLE_REVEIL,
        ];
        const notificationDejaOuverte = await this.notificationRepo.findOne({
            where: {
                patientId: p.patientId,
                statut: (0, typeorm_2.In)([
                    notification_cpa_entity_1.StatutNotificationCPA.EN_ATTENTE,
                    notification_cpa_entity_1.StatutNotificationCPA.RDV_PLANIFIE,
                ]),
            },
        });
        const actes = p.actes ?? p.ActeBloc ?? [];
        const acte = actes[0];
        const libelleEntrant = this.libelleComplet(actes);
        const interventionEntrante = libelleEntrant.toLowerCase();
        const memeInterventionOuverte = interventionEntrante !== '' &&
            ((!!notificationDejaOuverte &&
                (notificationDejaOuverte.intervention || '').trim().toLowerCase() ===
                    interventionEntrante) ||
                (!!patient &&
                    (patient.libelle || '').trim().toLowerCase() === interventionEntrante));
        const demandeSansLibelleDejaOuverte = interventionEntrante === '' && !!notificationDejaOuverte;
        const dejaPriseEnCharge = !retourPatient &&
            ((!!patient && enCoursOperation.includes(patient.statut)) ||
                memeInterventionOuverte ||
                demandeSansLibelleDejaOuverte);
        if (dejaPriseEnCharge) {
            this.logger.log(`🛡️ Ingestion ignorée : patient ${p.patientId}` +
                (memeInterventionOuverte
                    ? ` — même intervention "${libelleEntrant}" déjà en cours`
                    : demandeSansLibelleDejaOuverte
                        ? ' — demande sans acte nommé, notification déjà ouverte'
                        : ` — statut ${patient?.statut}, opération en cours`));
            await this.ingestionLedger.marquerIngeree({
                canal: ingestion_externe_entity_1.CanalIngestion.PRESCRIPTION_BLOC,
                referenceExterne: p.id,
                patientId: p.patientId,
                serviceSourceId: p.serviceIdSource,
                libelle: libelleEntrant || null,
            });
            await this.prescriptionClient.updateStatut(p.id, 'RECU_BLOC');
            return;
        }
        if (retourPatient) {
            this.logger.log(`↩️ Patient ${p.patientId} revient d'un épisode terminé (${patient.statut}) — nouvelle prescription traitée comme une nouvelle prise en charge`);
        }
        const niveauUrgence = (0, urgence_1.niveauDepuisLibelle)(p.urgence);
        const dateIntervention = this.extraireDateIntervention(p, acte);
        const serviceSourceNom = await this.serviceRegistryClient.getServiceName(p.serviceIdSource);
        const donneesPatient = {
            patientId: p.patientId,
            chuId: p.chuId,
            idDossier: patient?.idDossier || (0, id_dossier_1.construireIdDossier)(p.patientId),
            groupeSanguin: patient?.groupeSanguin || 'INCONNU',
            libelle: libelleEntrant || undefined,
            risqueHemorragique: acte?.risqueHemorragique || undefined,
            typeChirurgie: acte?.typeChirurgie || undefined,
            consignes: p.consignes || undefined,
            dateIntervention,
            alertes: p.alertes || undefined,
            prescripteurId: p.prescripteurId,
            chirurgien_nom: (acte?.nomChirurgien ?? p.chirurgien) || undefined,
            statut: patient_bloc_entity_1.PatientStatut.EN_ATTENTE_CPA,
            niveauUrgence,
            serviceOrigineId: p.serviceIdSource || undefined,
            serviceOrigine: serviceSourceNom || undefined,
            prescriptionExterneId: p.id,
        };
        if (patient) {
            Object.assign(patient, donneesPatient);
            await this.patientBlocRepo.save(patient);
        }
        else {
            patient = await this.patientBlocRepo.save(this.patientBlocRepo.create(donneesPatient));
        }
        const notif = await this.notificationRepo.save(this.notificationRepo.create({
            heurePrescription: new Date().toTimeString().substring(0, 5),
            dateIntervention,
            patientId: p.patientId,
            intervention: libelleEntrant || 'Intervention',
            chirurgienId: undefined,
            chirurgienNom: (acte?.nomChirurgien ?? p.chirurgien) || undefined,
            professeurCPA: undefined,
            serviceSourceId: p.serviceIdSource || undefined,
            serviceSourceNom: serviceSourceNom || undefined,
            estUrgent: (0, urgence_1.estNiveauUrgent)(niveauUrgence),
            statut: notification_cpa_entity_1.StatutNotificationCPA.EN_ATTENTE,
        }));
        this.logger.log(`📋 Nouvelle prescription bloc ingérée pour patient ${p.patientId} (${libelleEntrant || 'intervention'})`);
        await this.ingestionLedger.marquerIngeree({
            canal: ingestion_externe_entity_1.CanalIngestion.PRESCRIPTION_BLOC,
            referenceExterne: p.id,
            patientId: p.patientId,
            serviceSourceId: p.serviceIdSource,
            libelle: libelleEntrant || null,
        });
        await this.prescriptionClient.updateStatut(p.id, 'RECU_BLOC');
        await this.notificationBackClient.notifyService({
            serviceId,
            title: (0, urgence_1.estNiveauUrgent)(niveauUrgence)
                ? '🔴 Prescription urgente reçue'
                : '📋 Nouvelle prescription reçue',
            message: `${libelleEntrant || 'Intervention'} — patient ${p.patientId}`,
            type: 'new_prescription',
            source: 'bloc-operatoire',
            data: {
                patientId: p.patientId,
                notificationId: notif.id,
                urgence: p.urgence,
            },
        });
    }
};
exports.PrescriptionService = PrescriptionService;
__decorate([
    (0, schedule_1.Interval)(15000),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PrescriptionService.prototype, "pollPrescriptionsBloc", null);
exports.PrescriptionService = PrescriptionService = PrescriptionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(patient_bloc_entity_1.PatientBloc)),
    __param(1, (0, typeorm_1.InjectRepository)(notification_cpa_entity_1.NotificationCPA)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        prescription_externe_client_1.PrescriptionExterneClient,
        notification_back_client_1.NotificationBackClient,
        service_registry_client_1.ServiceRegistryClient,
        ingestion_ledger_service_1.IngestionLedgerService,
        config_1.ConfigService])
], PrescriptionService);
//# sourceMappingURL=prescription.service.js.map