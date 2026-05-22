import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { NotificationCPA, StatutNotificationCPA } from '../entities/notification-cpa.entity';
import { Patient, NiveauUrgence } from '../entities/patient.entity';
import { CreneauBloc, StatutCreneau } from '../entities/creneau-bloc.entity';

@Injectable()
export class NotificationAlerteService {
  constructor(
    @InjectRepository(NotificationCPA) private notifRepo: Repository<NotificationCPA>,
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    @InjectRepository(CreneauBloc) private creneauRepo: Repository<CreneauBloc>,
  ) {}

  async getAlertesUrgentes(): Promise<any> {
    // Patients urgents sans créneau planifié
    const patientsUrgents = await this.patientRepo.find({ where: { niveauUrgence: NiveauUrgence.URGENT } });
    const alertes: any[] = [];

    for (const patient of patientsUrgents) {
      const creneau = await this.creneauRepo.findOne({ where: { patientId: patient.id, statut: StatutCreneau.PLANIFIE } });
      if (!creneau) {
        alertes.push({ type: 'URGENCE_SANS_CRENEAU', patient, message: `Patient urgent sans créneau : ${patient.nom} ${patient.prenom}` });
      }
    }

    // Notifications CPA en attente depuis plus de 48h
    const dateLimite = new Date();
    dateLimite.setHours(dateLimite.getHours() - 48);
    const notifsEnRetard = await this.notifRepo.find({ where: { statut: StatutNotificationCPA.EN_ATTENTE, createdAt: LessThanOrEqual(dateLimite) }, relations: ['patient', 'chirurgien'] });

    for (const notif of notifsEnRetard) {
      alertes.push({ type: 'NOTIFICATION_RETARD', notification: notif, message: `Notification CPA en attente depuis +48h pour ${notif.patient.nom} ${notif.patient.prenom}` });
    }

    return { total: alertes.length, alertes };
  }

  async getResumeJour(): Promise<any> {
    const aujourdhui = new Date().toISOString().split('T')[0];
    const [creneauxJour, urgences, notifsEnAttente] = await Promise.all([
      this.creneauRepo.find({ where: { date: new Date(aujourdhui) }, relations: ['patient', 'chirurgien'] }),
      this.patientRepo.count({ where: { niveauUrgence: NiveauUrgence.URGENT } }),
      this.notifRepo.count({ where: { statut: StatutNotificationCPA.EN_ATTENTE } }),
    ]);

    return {
      date: aujourdhui,
      nombreCreneaux: creneauxJour.length,
      nombreUrgences: urgences,
      notificationsEnAttente: notifsEnAttente,
      creneaux: creneauxJour,
    };
  }
}
