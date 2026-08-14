import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { PatientBloc, PatientStatut } from '../entities/patient-bloc.entity';
import { NotificationOutgoingService } from '../external/notification-outgoing.service';
import { aSaPropreSalleDeReveil } from './service-non-operatoire';
import { NotificationBackClient } from '../external/notification-back.client';
import { TracabiliteService } from '../tracabilite/tracabilite.service';

@Injectable()
export class PatientBlocStatutService {
  private readonly logger = new Logger(PatientBlocStatutService.name);
  private readonly blocServiceId: string;

  constructor(
    @InjectRepository(PatientBloc)
    private patientBlocRepo: Repository<PatientBloc>,
    private notificationOutgoing: NotificationOutgoingService,
    private notificationBackClient: NotificationBackClient,
    private tracabiliteService: TracabiliteService,
    private config: ConfigService,
  ) {
    this.blocServiceId =
      this.config.get<string>('externalServices.serviceId') ?? '';
  }

  // Diffuse un évènement temps réel (même canal WebSocket que les nouvelles prescriptions/
  // demandes) à tous les postes connectés du bloc, pour qu'une liste "à traiter" (Fil de
  // travail, Programme opératoire...) se retire l'élément qui vient d'avancer sans attendre un
  // rechargement manuel. Type ignoré par TopBar (pas d'alerte sonore/visuelle parasite) — seules
  // les pages qui écoutent explicitement ce type y réagissent (voir useRefetchOnRealtimeUpdate).
  // Best-effort : ne doit jamais faire échouer la transition elle-même.
  private diffuserChangementStatut(
    patientId: string,
    ancienStatut: string,
    nouveauStatut: string,
  ): void {
    this.notificationBackClient
      .notifyService({
        serviceId: this.blocServiceId,
        title: 'Statut patient mis à jour',
        message: `${patientId} : ${ancienStatut} → ${nouveauStatut}`,
        type: 'patient_statut_change',
        source: 'bloc-operatoire',
        data: { patientId, ancienStatut, nouveauStatut },
      })
      .catch(() => {});
  }

  // Point de passage unique de TOUTE transition de statut patient dans l'application (CPA,
  // per-opératoire, réveil, sortie...) — y journaliser suffit à tracer l'ensemble du parcours
  // sans avoir à dupliquer un appel de traçabilité dans chaque service appelant.
  async changerStatut(
    patientId: string,
    nouveauStatut: PatientStatut,
    utilisateurId?: string,
  ): Promise<PatientBloc> {
    const patient = await this.patientBlocRepo.findOne({
      where: { patientId },
    });
    if (!patient)
      throw new NotFoundException(`Patient ${patientId} non trouvé`);

    const ancienStatut = patient.statut;

    const transitionsValides: Record<PatientStatut, PatientStatut[]> = {
      [PatientStatut.EN_ATTENTE_CPA]: [
        PatientStatut.CPA_REALISE,
        PatientStatut.CPA_INAPTE,
        // Patient de statut NORMAL venu d'un service non-opératoire (Endoscopie, Urgence,
        // Imagerie) dont la CPA est refusée ou reportée : retour au service d'origine + archivage
        // (voir CPAService.create). Les patients urgents, eux, restent suivis (simple notification).
        PatientStatut.SORTI,
      ],
      [PatientStatut.CPA_REALISE]: [
        PatientStatut.EN_ATTENTE_VERIFICATION_VEILLE,
        // Patient urgent/très urgent : pas de "veille" à attendre avant une opération le jour
        // même — bascule directe vers la liste des patients à opérer aujourd'hui (voir
        // CPAService.create, qui ne déclenche ce saut que pour niveauUrgence URGENT/TRES_URGENT).
        PatientStatut.PRET_POUR_BLOC,
      ],
      [PatientStatut.CPA_INAPTE]: [PatientStatut.SORTI],
      [PatientStatut.EN_ATTENTE_VERIFICATION_VEILLE]: [
        PatientStatut.VERIFICATION_VEILLE_REALISEE,
      ],
      [PatientStatut.VERIFICATION_VEILLE_REALISEE]: [
        PatientStatut.PRET_POUR_BLOC,
      ],
      [PatientStatut.PRET_POUR_BLOC]: [PatientStatut.EN_COURS_OPERATION],
      [PatientStatut.EN_COURS_OPERATION]: [
        PatientStatut.EN_SALLE_REVEIL,
        // Acte anesthésique réalisé hors bloc pour un service qui possède sa propre salle de
        // réveil (Imagerie, Scanner) : retour au service + archivage direct, sans passer par la
        // salle de réveil du Bloc (voir checklist-apres-op / protocole). Endoscopie et Urgence,
        // eux, sont surveillés par le même anesthésiste du Bloc : ils suivent le flux complet et
        // passent par EN_SALLE_REVEIL comme les patients de la chirurgie.
        PatientStatut.SORTI,
      ],
      [PatientStatut.EN_SALLE_REVEIL]: [PatientStatut.SORTI],
      [PatientStatut.SORTI]: [],
    };

    const autorise =
      transitionsValides[patient.statut]?.includes(nouveauStatut);
    if (!autorise)
      throw new ConflictException(
        `Transition invalide : ${patient.statut} → ${nouveauStatut}`,
      );

    patient.statut = nouveauStatut;
    const saved = await this.patientBlocRepo.save(patient);
    await this.tracabiliteService.log(
      'PatientBloc',
      patientId,
      'STATUT_CHANGE',
      { ancienStatut, nouveauStatut },
      utilisateurId,
    );
    this.diffuserChangementStatut(patientId, ancienStatut, nouveauStatut);
    return saved;
  }

  // Fait avancer le patient jusqu'à EN_COURS_OPERATION en franchissant les étapes
  // intermédiaires nécessaires (aucune route ne faisait explicitement passer par
  // PRET_POUR_BLOC/EN_COURS_OPERATION avant la checklist pendant-op — Time Out — qui marque
  // dans les faits le vrai début de l'opération). Idempotent : ne fait rien si le patient est
  // déjà à EN_COURS_OPERATION ou au-delà.
  async avancerVersEnCoursOperation(
    patientId: string,
    utilisateurId?: string,
  ): Promise<void> {
    const patient = await this.patientBlocRepo.findOne({
      where: { patientId },
    });
    if (!patient) return;

    if (patient.statut === PatientStatut.VERIFICATION_VEILLE_REALISEE) {
      await this.changerStatut(
        patientId,
        PatientStatut.PRET_POUR_BLOC,
        utilisateurId,
      );
      await this.changerStatut(
        patientId,
        PatientStatut.EN_COURS_OPERATION,
        utilisateurId,
      );
    } else if (patient.statut === PatientStatut.PRET_POUR_BLOC) {
      await this.changerStatut(
        patientId,
        PatientStatut.EN_COURS_OPERATION,
        utilisateurId,
      );
    }
  }

  // Décision de triage sur le fil de prescription : le patient est apte à suivre le circuit CPA.
  // Bascule (ou remet) le patient en attente de planification CPA.
  async marquerApteCpa(
    patientId: string,
    utilisateurId?: string,
  ): Promise<PatientBloc> {
    const patient = await this.patientBlocRepo.findOne({
      where: { patientId },
    });
    if (!patient)
      throw new NotFoundException(`Patient ${patientId} non trouvé`);

    if (patient.statut === PatientStatut.CPA_INAPTE) {
      patient.statut = PatientStatut.EN_ATTENTE_CPA;
      patient.motifRefusCpa = null;
      await this.patientBlocRepo.save(patient);
      await this.tracabiliteService.log(
        'PatientBloc',
        patientId,
        'STATUT_CHANGE',
        { ancienStatut: PatientStatut.CPA_INAPTE, nouveauStatut: PatientStatut.EN_ATTENTE_CPA },
        utilisateurId,
      );
      // Contourne changerStatut (CPA_INAPTE → EN_ATTENTE_CPA n'est pas une transition normale
      // de la machine à états, voir sa table plus haut) — la diffusion doit donc être répétée ici.
      this.diffuserChangementStatut(
        patientId,
        PatientStatut.CPA_INAPTE,
        PatientStatut.EN_ATTENTE_CPA,
      );
    }
    return patient;
  }

  // Décision de triage sur le fil de prescription : le patient est inapte au circuit CPA.
  // Nécessite un motif de refus, notifie automatiquement le service d'origine.
  async marquerInapteCpa(
    patientId: string,
    motifRefus: string,
    utilisateurId?: string,
  ): Promise<PatientBloc> {
    if (!motifRefus || !motifRefus.trim()) {
      throw new BadRequestException('Le motif du refus est obligatoire.');
    }

    const patient = await this.changerStatut(
      patientId,
      PatientStatut.CPA_INAPTE,
      utilisateurId,
    );
    patient.motifRefusCpa = motifRefus.trim();
    await this.patientBlocRepo.save(patient);

    try {
      // Identifiant suffisant : voir NotificationOutgoingService.notifyOriginService — exiger
      // aussi le nom résolu privait de retour les services que le registre central ne résout pas.
      if (patient.serviceOrigineId) {
        await this.notificationOutgoing.notifyOriginService({
          patientId,
          type: 'CPA_INAPTE',
          serviceOrigineId: patient.serviceOrigineId,
          serviceOrigineName: patient.serviceOrigine,
          payload: { motifRefus: patient.motifRefusCpa },
        });
      }
    } catch (err) {
      this.logger.error(
        `Erreur notification service origine après refus CPA: ${(err as Error).message}`,
      );
    }

    return patient;
  }

  // Pendant la réalisation de la CPA, le Responsable CPA peut ajuster la date et l'heure
  // prévues de l'opération (ex. créneau chirurgical décalé après l'évaluation pré-anesthésique).
  async modifierDateIntervention(
    patientId: string,
    dateIntervention: string,
    utilisateurId?: string,
  ): Promise<PatientBloc> {
    const aujourdhui = new Date().toISOString().split('T')[0];
    if (new Date(dateIntervention).toISOString().split('T')[0] < aujourdhui) {
      throw new BadRequestException(
        "Impossible de planifier l'opération à une date passée.",
      );
    }

    const patient = await this.patientBlocRepo.findOne({
      where: { patientId },
    });
    if (!patient)
      throw new NotFoundException(`Patient ${patientId} non trouvé`);

    const ancienneDate = patient.dateIntervention;
    const dateInchangee =
      ancienneDate &&
      new Date(ancienneDate).getTime() === new Date(dateIntervention).getTime();
    patient.dateIntervention = new Date(dateIntervention);
    const saved = await this.patientBlocRepo.save(patient);
    await this.tracabiliteService.log(
      'PatientBloc',
      patientId,
      'UPDATE',
      { champ: 'dateIntervention', ancienneValeur: ancienneDate, nouvelleValeur: patient.dateIntervention },
      utilisateurId,
    );

    // Toute modification RÉELLE de la date d'opération (ex. report décidé pendant la CPA) doit
    // être répercutée sans délai vers le service demandeur — mais pas un simple ré-enregistrement
    // de la même date (ex. re-soumission du formulaire), qui déclenchait une alerte "date
    // modifiée" trompeuse sans rien de changé.
    if (!dateInchangee && patient.serviceOrigineId) {
      try {
        await this.notificationOutgoing.notifyOriginService({
          patientId,
          type: 'DATE_OPERATION_MODIFIEE',
          serviceOrigineId: patient.serviceOrigineId,
          serviceOrigineName: patient.serviceOrigine,
          payload: {
            ancienneDate,
            nouvelleDate: patient.dateIntervention,
          },
        });
      } catch (err) {
        this.logger.error(
          `Erreur notification service origine après modification date opération: ${(err as Error).message}`,
        );
      }
    }
    return saved;
  }

  // Fin de parcours au Bloc : archivage (SORTI) + retour du patient à son service d'origine,
  // qui le récupère pour la suite de sa prise en charge (le service d'origine possède sa propre
  // salle de réveil). Déclenché soit après une CPA non conforme d'un patient non-opératoire
  // (refusée/reportée), soit après la réalisation de l'acte anesthésique. Notifie le service
  // d'origine (best-effort, ne doit jamais faire échouer l'archivage).
  async archiverRetourServiceOrigine(
    patientId: string,
    utilisateurId?: string,
    raison: 'CPA_NON_CONFORME' | 'FIN_ACTE_ANESTHESIQUE' = 'FIN_ACTE_ANESTHESIQUE',
  ): Promise<PatientBloc> {
    const patient = await this.changerStatut(
      patientId,
      PatientStatut.SORTI,
      utilisateurId,
    );

    if (patient.serviceOrigineId) {
      try {
        // CPA non conforme : pas de notification supplémentaire ici — le service d'origine est
        // déjà notifié par le flux CPA lui-même (CPA_INAPTE / CPA_REPORT, voir CPAService.create).
        // Seul le retour après acte anesthésique (aucun autre canal) notifie ici.
        if (raison === 'FIN_ACTE_ANESTHESIQUE') {
          await this.notificationOutgoing.notifyOriginService({
            patientId,
            type: 'RETOUR_SERVICE_ORIGINE',
            serviceOrigineId: patient.serviceOrigineId,
            serviceOrigineName: patient.serviceOrigine,
            payload: {
              raison,
              retourServiceOrigine: true,
            },
          });
        }
      } catch (err) {
        this.logger.error(
          `Erreur notification service origine après retour/archivage patient ${patientId}: ${(err as Error).message}`,
        );
      }
    }

    return patient;
  }

  // Vrai si le patient vient d'un service qui possède sa propre salle de réveil (Imagerie,
  // Scanner...) : la check-list après intervention ne doit pas le transférer vers la salle de
  // réveil du Bloc — il y retournera et sera archivé après le protocole anesthésique. Les
  // patients d'Endoscopie/Urgence, surveillés par le même anesthésiste du Bloc, suivent au
  // contraire le flux complet (transfert + surveillance + sortie en salle de réveil du Bloc).
  async aSaPropreSalleDeReveil(patientId: string): Promise<boolean> {
    const patient = await this.patientBlocRepo.findOne({
      where: { patientId },
    });
    return aSaPropreSalleDeReveil(patient?.serviceOrigine);
  }
}
