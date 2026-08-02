import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientBloc, PatientStatut } from '../entities/patient-bloc.entity';
import { NotificationOutgoingService } from '../external/notification-outgoing.service';
import { TracabiliteService } from '../tracabilite/tracabilite.service';

@Injectable()
export class PatientBlocStatutService {
  private readonly logger = new Logger(PatientBlocStatutService.name);

  constructor(
    @InjectRepository(PatientBloc)
    private patientBlocRepo: Repository<PatientBloc>,
    private notificationOutgoing: NotificationOutgoingService,
    private tracabiliteService: TracabiliteService,
  ) {}

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
      ],
      [PatientStatut.CPA_REALISE]: [
        PatientStatut.EN_ATTENTE_VERIFICATION_VEILLE,
        // Patient urgent/très urgent : pas de "veille" à attendre avant une opération le jour
        // même — bascule directe vers la liste des patients à opérer aujourd'hui (voir
        // CPAService.create, qui ne déclenche ce saut que pour niveauUrgence URGENT/TRES_URGENT).
        PatientStatut.PRET_POUR_BLOC,
      ],
      [PatientStatut.CPA_INAPTE]: [],
      [PatientStatut.EN_ATTENTE_VERIFICATION_VEILLE]: [
        PatientStatut.VERIFICATION_VEILLE_REALISEE,
      ],
      [PatientStatut.VERIFICATION_VEILLE_REALISEE]: [
        PatientStatut.PRET_POUR_BLOC,
      ],
      [PatientStatut.PRET_POUR_BLOC]: [PatientStatut.EN_COURS_OPERATION],
      [PatientStatut.EN_COURS_OPERATION]: [PatientStatut.EN_SALLE_REVEIL],
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
      if (patient.serviceOrigineId && patient.serviceOrigine) {
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
    patient.dateIntervention = new Date(dateIntervention);
    const saved = await this.patientBlocRepo.save(patient);
    await this.tracabiliteService.log(
      'PatientBloc',
      patientId,
      'UPDATE',
      { champ: 'dateIntervention', ancienneValeur: ancienneDate, nouvelleValeur: patient.dateIntervention },
      utilisateurId,
    );
    return saved;
  }
}
