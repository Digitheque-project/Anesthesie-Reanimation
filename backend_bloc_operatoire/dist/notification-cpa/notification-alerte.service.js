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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationAlerteService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_cpa_entity_1 = require("../entities/notification-cpa.entity");
const patient_bloc_entity_1 = require("../entities/patient-bloc.entity");
const creneau_bloc_entity_1 = require("../entities/creneau-bloc.entity");
const accueil_client_1 = require("../external/accueil.client");
let NotificationAlerteService = class NotificationAlerteService {
    notifRepo;
    patientBlocRepo;
    creneauRepo;
    accueilClient;
    constructor(notifRepo, patientBlocRepo, creneauRepo, accueilClient) {
        this.notifRepo = notifRepo;
        this.patientBlocRepo = patientBlocRepo;
        this.creneauRepo = creneauRepo;
        this.accueilClient = accueilClient;
    }
    async getAlertesUrgentes() {
        const patientsUrgents = await this.patientBlocRepo.find({
            where: { niveauUrgence: patient_bloc_entity_1.NiveauUrgence.URGENT },
        });
        const patientsUrgentsEnrichis = await this.accueilClient.enrichWithIdentity(patientsUrgents);
        const alertes = [];
        for (const patient of patientsUrgentsEnrichis) {
            const creneau = await this.creneauRepo.findOne({
                where: { patientId: patient.patientId, statut: creneau_bloc_entity_1.StatutCreneau.PLANIFIE },
            });
            if (!creneau) {
                const nomComplet = patient.patient
                    ? `${patient.patient.nom} ${patient.patient.prenom}`
                    : patient.patientId;
                alertes.push({
                    type: 'URGENCE_SANS_CRENEAU',
                    patient,
                    message: `Patient urgent sans créneau : ${nomComplet}`,
                });
            }
        }
        const dateLimite = new Date();
        dateLimite.setHours(dateLimite.getHours() - 48);
        const notifsEnRetardRaw = await this.notifRepo.find({
            where: {
                statut: notification_cpa_entity_1.StatutNotificationCPA.EN_ATTENTE,
                createdAt: (0, typeorm_2.LessThanOrEqual)(dateLimite),
            },
        });
        const notifsEnRetard = await this.accueilClient.enrichWithIdentity(notifsEnRetardRaw);
        for (const notif of notifsEnRetard) {
            const nomComplet = notif.patient
                ? `${notif.patient.nom} ${notif.patient.prenom}`
                : notif.patientId;
            alertes.push({
                type: 'NOTIFICATION_RETARD',
                notification: notif,
                message: `Notification CPA en attente depuis +48h pour ${nomComplet}`,
            });
        }
        return { total: alertes.length, alertes };
    }
    async getResumeJour() {
        const aujourdhui = new Date().toISOString().split('T')[0];
        const [creneauxJourRaw, urgences, notifsEnAttente] = await Promise.all([
            this.creneauRepo.find({ where: { date: new Date(aujourdhui) } }),
            this.patientBlocRepo.count({
                where: { niveauUrgence: patient_bloc_entity_1.NiveauUrgence.URGENT },
            }),
            this.notifRepo.count({
                where: { statut: notification_cpa_entity_1.StatutNotificationCPA.EN_ATTENTE },
            }),
        ]);
        const creneauxJour = await this.accueilClient.enrichWithIdentity(creneauxJourRaw);
        return {
            date: aujourdhui,
            nombreCreneaux: creneauxJour.length,
            nombreUrgences: urgences,
            notificationsEnAttente: notifsEnAttente,
            creneaux: creneauxJour,
        };
    }
};
exports.NotificationAlerteService = NotificationAlerteService;
exports.NotificationAlerteService = NotificationAlerteService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_cpa_entity_1.NotificationCPA)),
    __param(1, (0, typeorm_1.InjectRepository)(patient_bloc_entity_1.PatientBloc)),
    __param(2, (0, typeorm_1.InjectRepository)(creneau_bloc_entity_1.CreneauBloc)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        accueil_client_1.AccueilClient])
], NotificationAlerteService);
//# sourceMappingURL=notification-alerte.service.js.map