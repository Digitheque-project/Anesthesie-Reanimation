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
<<<<<<< HEAD
    dernierPoll = 0;
    constructor(patientBlocRepo, notificationRepo, prescriptionClient, notificationBackClient, serviceRegistryClient, ingestionLedger, config) {
=======
    constructor(patientBlocRepo, notificationRepo, prescriptionClient, notificationBackClient, serviceRegistryClient, config) {
>>>>>>> a733407 (commit 1508)
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
    champPrescription(p, acte, ...noms) {
        for (const source of [acte, p]) {
            if (!source)
                continue;
            for (const nom of noms) {
                const valeur = source[nom];
                if (valeur === null || valeur === undefined)
                    continue;
                const texte = Array.isArray(valeur)
                    ? valeur
                        .map((v) => v && typeof v === 'object'
                        ? String(v.libelle ?? v.nom ?? v.label ?? '')
                        : String(v ?? ''))
                        .map((v) => v.trim())
                        .filter((v) => v !== '')
                        .join(', ')
                    : String(valeur).trim();
                if (texte !== '' && texte !== '[object Object]')
                    return texte;
            }
        }
        return undefined;
    }
    dureeEnMinutes(p, acte) {
        const heures = Number(this.champPrescription(p, acte, 'dureeHeures') ?? NaN);
        const minutesSeules = Number(this.champPrescription(p, acte, 'dureeMinutes') ?? NaN);
        if (Number.isFinite(heures) || Number.isFinite(minutesSeules)) {
            const total = (Number.isFinite(heures) ? heures : 0) * 60 +
                (Number.isFinite(minutesSeules) ? minutesSeules : 0);
            return total > 0 ? total : undefined;
        }
        const valeur = this.champPrescription(p, acte, 'dureeInterventionMinutes', 'dureeIntervention', 'dureePrevue');
        if (!valeur)
            return undefined;
        const heuresMinutes = valeur.match(/^(\d+)\s*h\s*(\d*)$/i);
        if (heuresMinutes) {
            return Number(heuresMinutes[1]) * 60 + Number(heuresMinutes[2] || 0);
        }
        const minutes = parseInt(valeur, 10);
        return Number.isFinite(minutes) && minutes > 0 ? minutes : undefined;
    }
    async ingerer(p, serviceId) {
        if (await this.ingestionLedger.dejaIngeree(ingestion_externe_entity_1.CanalIngestion.PRESCRIPTION_BLOC, p.id)) {
            await this.prescriptionClient.updateStatut(p.id, 'RECU_BLOC');
            return;
<<<<<<< HEAD
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
=======
        const notificationDejaEnAttente = await this.notificationRepo.findOne({
>>>>>>> a733407 (commit 1508)
            where: {
                patientId: p.patientId,
                statut: notification_cpa_entity_1.StatutNotificationCPA.EN_ATTENTE,
            },
        });
<<<<<<< HEAD
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
            await this.prescriptionClient.updateStatut(p.id, 'RECU_BLOC');
            return;
        }
        if (retourPatient) {
            this.logger.log(`↩️ Patient ${p.patientId} revient d'un épisode terminé (${patient.statut}) — nouvelle prescription traitée comme une nouvelle prise en charge`);
        }
        const niveauUrgence = (0, urgence_1.niveauDepuisLibelle)(p.urgence);
        const dateIntervention = this.extraireDateIntervention(p, acte);
=======
        if (notificationDejaEnAttente)
            return;
        const patientDejaTraite = await this.patientBlocRepo.findOne({
            where: { patientId: p.patientId },
        });
        if (patientDejaTraite &&
            patientDejaTraite.statut !== patient_bloc_entity_1.PatientStatut.EN_ATTENTE_CPA) {
            return;
        }
        const acte = p.actes?.[0] ?? p.ActeBloc?.[0];
        const niveauUrgence = this.mapUrgence(p.urgence);
        const dateIntervention = this.extraireDateIntervention(acte);
>>>>>>> a733407 (commit 1508)
        const serviceSourceNom = await this.serviceRegistryClient.getServiceName(p.serviceIdSource);
        let patient = await this.patientBlocRepo.findOne({
            where: { patientId: p.patientId },
        });
        const donneesPatient = {
            patientId: p.patientId,
            chuId: p.chuId,
            idDossier: patient?.idDossier || (0, id_dossier_1.construireIdDossier)(p.patientId),
            groupeSanguin: patient?.groupeSanguin || 'INCONNU',
            libelle: libelleEntrant || undefined,
            risqueHemorragique: this.champPrescription(p, acte, 'risqueHemorragique') || undefined,
            typeChirurgie: this.champPrescription(p, acte, 'typeChirurgie') || undefined,
            consignes: p.consignes || undefined,
            dateIntervention,
            renseignementClinique: this.champPrescription(p, acte, 'renseignementClinique', 'renseignementsCliniques'),
            typeAnesthesie: this.champPrescription(p, acte, 'typeAnesthesie'),
            dureeInterventionMinutes: this.dureeEnMinutes(p, acte),
            risqueInfectieux: this.champPrescription(p, acte, 'risqueInfectieux'),
            materielNecessaire: this.champPrescription(p, acte, 'materiels', 'materielNecessaire', 'materiel'),
            positionPatient: this.champPrescription(p, acte, 'positions', 'positionPatient', 'position'),
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