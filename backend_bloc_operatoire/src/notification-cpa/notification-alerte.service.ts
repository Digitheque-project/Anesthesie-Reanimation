import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import {
  NotificationCPA,
  StatutNotificationCPA,
} from '../entities/notification-cpa.entity';
import { PatientBloc, NiveauUrgence } from '../entities/patient-bloc.entity';
import { CreneauBloc, StatutCreneau } from '../entities/creneau-bloc.entity';
import { AccueilClient } from '../external/accueil.client';

@Injectable()
export class NotificationAlerteService {
  constructor(
    @InjectRepository(NotificationCPA)
    private notifRepo: Repository<NotificationCPA>,
    @InjectRepository(PatientBloc)
    private patientBlocRepo: Repository<PatientBloc>,
    @InjectRepository(CreneauBloc) private creneauRepo: Repository<CreneauBloc>,
    private accueilClient: AccueilClient,
  ) {}

  async getAlertesUrgentes(): Promise<any> {
    // Patients urgents sans créneau planifié
    const patientsUrgents = await this.patientBlocRepo.find({
      where: { niveauUrgence: NiveauUrgence.URGENT },
    });
    const patientsUrgentsEnrichis =
      await this.accueilClient.enrichWithIdentity(patientsUrgents);
    const alertes: any[] = [];

    for (const patient of patientsUrgentsEnrichis) {
      const creneau = await this.creneauRepo.findOne({
        where: { patientId: patient.patientId, statut: StatutCreneau.PLANIFIE },
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

    // Notifications CPA en attente depuis plus de 48h
    const dateLimite = new Date();
    dateLimite.setHours(dateLimite.getHours() - 48);
    const notifsEnRetardRaw = await this.notifRepo.find({
      where: {
        statut: StatutNotificationCPA.EN_ATTENTE,
        createdAt: LessThanOrEqual(dateLimite),
      },
    });
    const notifsEnRetard =
      await this.accueilClient.enrichWithIdentity(notifsEnRetardRaw);

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

  async getResumeJour(): Promise<any> {
    const aujourdhui = new Date().toISOString().split('T')[0];
    const [creneauxJourRaw, urgences, notifsEnAttente] = await Promise.all([
      this.creneauRepo.find({ where: { date: new Date(aujourdhui) } }),
      this.patientBlocRepo.count({
        where: { niveauUrgence: NiveauUrgence.URGENT },
      }),
      this.notifRepo.count({
        where: { statut: StatutNotificationCPA.EN_ATTENTE },
      }),
    ]);
    const creneauxJour =
      await this.accueilClient.enrichWithIdentity(creneauxJourRaw);

    return {
      date: aujourdhui,
      nombreCreneaux: creneauxJour.length,
      nombreUrgences: urgences,
      notificationsEnAttente: notifsEnAttente,
      creneaux: creneauxJour,
    };
  }
}
