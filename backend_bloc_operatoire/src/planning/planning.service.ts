import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  CreneauBloc,
  StatutCreneau,
  TypeRDV,
} from '../entities/creneau-bloc.entity';
import { PatientBloc, PatientStatut } from '../entities/patient-bloc.entity';
import {
  NotificationCPA,
  StatutNotificationCPA,
} from '../entities/notification-cpa.entity';
import { AccueilClient } from '../external/accueil.client';
import { MedecinIdentiteService } from '../medecin/medecin-identite.service';
import { verifierCreneauValide } from './creneau-validation.util';

@Injectable()
export class PlanningService {
  constructor(
    @InjectRepository(CreneauBloc) private creneauRepo: Repository<CreneauBloc>,
    @InjectRepository(PatientBloc)
    private patientBlocRepo: Repository<PatientBloc>,
    @InjectRepository(NotificationCPA)
    private notificationRepo: Repository<NotificationCPA>,
    private accueilClient: AccueilClient,
    private medecinIdentiteService: MedecinIdentiteService,
  ) {}

  // Attache une clé `.patient` (identité Accueil + statut/niveauUrgence locaux) et `.chirurgien`
  // (identité résolue via CentralUserClient/table locale) à chaque créneau.
  private async enrichCreneaux(data: CreneauBloc[]): Promise<any[]> {
    if (data.length === 0) return [];
    const identities = await this.accueilClient.enrichWithIdentity(data);
    const avecChirurgien = await this.medecinIdentiteService.enrichir(
      data,
      'chirurgienId',
      'chirurgien',
    );
    const patientIds = Array.from(
      new Set(data.map((c) => c.patientId).filter(Boolean)),
    );
    const patients = patientIds.length
      ? await this.patientBlocRepo.find({
          where: { patientId: In(patientIds) },
        })
      : [];
    const patientMap = new Map(patients.map((p) => [p.patientId, p]));

    // CreneauBloc.chirurgienId n'est renseigné que si un Medecin local a été explicitement
    // désigné — jamais le cas pour une CPA planifiée depuis le fil de prescription, où seul un
    // nom libre (chirurgienNom) est connu, transmis par le service Prescriptions et déjà stocké
    // sur la notification d'origine. Sans ce repli, la colonne "Chirurgien" du Fil de travail
    // restait vide pour la quasi-totalité des rendez-vous CPA.
    const notifs = patientIds.length
      ? await this.notificationRepo.find({
          where: { patientId: In(patientIds) },
          order: { createdAt: 'DESC' },
        })
      : [];
    const chirurgienNomParPatient = new Map<string, string>();
    for (const n of notifs) {
      if (n.chirurgienNom && !chirurgienNomParPatient.has(n.patientId)) {
        chirurgienNomParPatient.set(n.patientId, n.chirurgienNom);
      }
    }

    return data.map((c, idx) => {
      const identity = identities[idx] || {};
      const pb = patientMap.get(c.patientId);
      const chirurgienResolu = avecChirurgien[idx]?.chirurgien;
      const chirurgienNomLibre = chirurgienNomParPatient.get(c.patientId);
      return {
        ...c,
        chirurgien:
          chirurgienResolu ??
          (chirurgienNomLibre ? { nom: chirurgienNomLibre } : null),
        patient: {
          id: c.patientId,
          nom: identity.nom,
          prenom: identity.prenom,
          idDossier: identity.idDossier ?? pb?.idDossier,
          statut: pb?.statut,
          niveauUrgence: pb?.niveauUrgence,
        },
      };
    });
  }

  async getPlanningJour(jour: string, type?: TypeRDV) {
    const qb = this.creneauRepo
      .createQueryBuilder('c')
      .where('c.date = :date', { date: jour })
      .orderBy('c.heureDebut', 'ASC');
    if (type) qb.andWhere('c.type = :type', { type });
    const data = await qb.getMany();
    return this.enrichCreneaux(data);
  }

  async getPlanningSemaine(debut: string, fin: string, type?: TypeRDV) {
    const qb = this.creneauRepo
      .createQueryBuilder('c')
      .where('c.date >= :debut', { debut })
      .andWhere('c.date <= :fin', { fin })
      .orderBy('c.date', 'ASC')
      .addOrderBy('c.heureDebut', 'ASC');
    if (type) qb.andWhere('c.type = :type', { type });
    const data = await qb.getMany();
    return this.enrichCreneaux(data);
  }

  async reserverCreneau(dto: any) {
    const type: TypeRDV = dto.type || TypeRDV.CPA;
    // Le type conditionne la règle d'unicité d'horaire (voir verifierCreneauValide) : une
    // vérification veille n'occupe pas un créneau à elle seule.
    await verifierCreneauValide(
      this.creneauRepo,
      dto.date,
      dto.heureDebut,
      type,
    );

    const creneau = this.creneauRepo.create({ ...dto, type });
    const saved = await this.creneauRepo.save(creneau);

    // Ferme une faille où un RDV réservé directement depuis la fiche patient (au lieu du
    // bouton "Planifier CPA" de la page Notifications, qui appelle explicitement
    // NotificationCPAService.planifierRDV) laissait la notification bloquée à EN_ATTENTE pour
    // toujours — le patient restait donc affiché indéfiniment dans le fil de prescription même
    // après avoir déjà un rendez-vous. Toute réservation de créneau CPA fait maintenant avancer
    // la notification correspondante, quel que soit l'écran d'où elle a été créée.
    const patientId = (saved as any).patientId;
    if (patientId) {
      await this.notificationRepo.update(
        { patientId, statut: StatutNotificationCPA.EN_ATTENTE },
        { statut: StatutNotificationCPA.RDV_PLANIFIE },
      );
    }

    return saved;
  }

  async annulerCreneau(id: string) {
    const creneau = await this.creneauRepo.findOne({ where: { id } });
    if (!creneau) throw new NotFoundException('Créneau non trouvé');
    creneau.statut = StatutCreneau.ANNULE;
    const saved = await this.creneauRepo.save(creneau);

    // Symétrique du basculement fait dans reserverCreneau : sans ça, annuler un RDV CPA laissait
    // la notification bloquée à RDV_PLANIFIE pour toujours — le patient disparaissait du fil de
    // prescription alors qu'il n'a plus aucun rendez-vous réel. On ne touche pas à REALISE (CPA
    // déjà faite : annuler un créneau obsolète après coup ne doit pas rouvrir le dossier).
    if (creneau.type === TypeRDV.CPA && creneau.patientId) {
      await this.notificationRepo.update(
        { patientId: creneau.patientId, statut: StatutNotificationCPA.RDV_PLANIFIE },
        { statut: StatutNotificationCPA.EN_ATTENTE },
      );
    }

    return saved;
  }

  async getUrgencesEnAttente() {
    const data = await this.creneauRepo.find({ where: { estUrgence: true } });
    return this.enrichCreneaux(data);
  }

  // Rendez-vous CPA/vérification veille à venir (aujourd'hui inclus, jamais annulés) — utilisé
  // pour la bannière d'alerte du Fil de travail, qui liste les patients déjà planifiés (retirés
  // du fil de prescription) sans obliger à parcourir le calendrier jour par jour.
  async getProchainsRdvCpa() {
    const aujourdhui = new Date().toISOString().split('T')[0];
    const data = await this.creneauRepo
      .createQueryBuilder('c')
      .where('c.type = :type', { type: TypeRDV.CPA })
      .andWhere('c.date >= :aujourdhui', { aujourdhui })
      .andWhere('c.statut != :annule', { annule: StatutCreneau.ANNULE })
      .orderBy('c.date', 'ASC')
      .addOrderBy('c.heureDebut', 'ASC')
      .getMany();
    return this.enrichCreneaux(data);
  }

  // Retards : trois catégories de dates prévues déjà dépassées sans que l'étape correspondante
  // ait été faite — utilisé pour la pastille du menu (Fil de travail) et les bandeaux/alertes
  // d'écran, pour qu'un rendez-vous manqué reste visible au lieu de disparaître silencieusement
  // (cas de getProchainsRdvCpa, qui exclut au contraire tout ce qui est déjà passé).
  async getRetards() {
    const aujourdhui = new Date().toISOString().split('T')[0];

    const creneauxCpa = await this.creneauRepo
      .createQueryBuilder('c')
      .where('c.type = :type', { type: TypeRDV.CPA })
      .andWhere('c.date < :aujourdhui', { aujourdhui })
      .andWhere('c.statut != :annule', { annule: StatutCreneau.ANNULE })
      .orderBy('c.date', 'ASC')
      .getMany();
    const cpaRetard = (await this.enrichCreneaux(creneauxCpa)).filter(
      (c: any) => c.patient?.statut === PatientStatut.EN_ATTENTE_CPA,
    );

    // La vérification veille ne dépend plus d'un créneau planifié à une date précise (voir
    // rendez-vous/page.tsx) : "en retard" se juge directement sur la date d'intervention du
    // patient, tant que la vérification n'a pas été faite.
    const patientsEnAttenteVerif = await this.patientBlocRepo.find({
      where: { statut: PatientStatut.EN_ATTENTE_VERIFICATION_VEILLE },
    });
    const enRetardVerif = patientsEnAttenteVerif.filter(
      (p) => p.dateIntervention && new Date(p.dateIntervention) < new Date(aujourdhui),
    );
    const verificationVeilleRetard = await this.accueilClient.enrichWithIdentity(enRetardVerif);

    // Opération : date prévue dépassée alors que le patient n'est pas encore passé en salle.
    const statutsAvantOperation = [
      PatientStatut.EN_ATTENTE_CPA,
      PatientStatut.CPA_REALISE,
      PatientStatut.EN_ATTENTE_VERIFICATION_VEILLE,
      PatientStatut.VERIFICATION_VEILLE_REALISEE,
      PatientStatut.PRET_POUR_BLOC,
    ];
    const patientsAvantOperation = await this.patientBlocRepo.find({
      where: { statut: In(statutsAvantOperation) },
    });
    const enRetardOperation = patientsAvantOperation.filter(
      (p) => p.dateIntervention && new Date(p.dateIntervention) < new Date(aujourdhui),
    );
    const operationRetard = await this.accueilClient.enrichWithIdentity(enRetardOperation);

    // Total en patients distincts, pas en lignes : un même patient peut apparaître dans plusieurs
    // catégories (ex. vérification veille ET opération en retard), compter les lignes gonflerait
    // artificiellement la pastille.
    const idsDistincts = new Set([
      ...cpaRetard.map((c: any) => c.patientId),
      ...verificationVeilleRetard.map((p: any) => p.patientId),
      ...operationRetard.map((p: any) => p.patientId),
    ]);

    return {
      cpaRetard,
      verificationVeilleRetard,
      operationRetard,
      total: idsDistincts.size,
    };
  }
}
