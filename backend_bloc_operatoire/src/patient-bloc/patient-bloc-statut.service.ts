import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientBloc, PatientStatut } from '../entities/patient-bloc.entity';
import { NotificationOutgoingService } from '../external/notification-outgoing.service';

@Injectable()
export class PatientBlocStatutService {
  private readonly logger = new Logger(PatientBlocStatutService.name);

  constructor(
    @InjectRepository(PatientBloc) private patientBlocRepo: Repository<PatientBloc>,
    private notificationOutgoing: NotificationOutgoingService,
  ) {}

  async changerStatut(patientId: string, nouveauStatut: PatientStatut): Promise<PatientBloc> {
    const patient = await this.patientBlocRepo.findOne({ where: { patientId } });
    if (!patient) throw new NotFoundException(`Patient ${patientId} non trouvé`);

    const transitionsValides: Record<PatientStatut, PatientStatut[]> = {
      [PatientStatut.EN_ATTENTE_CPA]: [PatientStatut.CPA_REALISE, PatientStatut.CPA_INAPTE],
      [PatientStatut.CPA_REALISE]: [PatientStatut.EN_ATTENTE_VERIFICATION_VEILLE],
      [PatientStatut.CPA_INAPTE]: [],
      [PatientStatut.EN_ATTENTE_VERIFICATION_VEILLE]: [PatientStatut.VERIFICATION_VEILLE_REALISEE],
      [PatientStatut.VERIFICATION_VEILLE_REALISEE]: [PatientStatut.PRET_POUR_BLOC],
      [PatientStatut.PRET_POUR_BLOC]: [PatientStatut.EN_COURS_OPERATION],
      [PatientStatut.EN_COURS_OPERATION]: [PatientStatut.EN_SALLE_REVEIL],
      [PatientStatut.EN_SALLE_REVEIL]: [PatientStatut.SORTI],
      [PatientStatut.SORTI]: [],
    };

    const autorise = transitionsValides[patient.statut]?.includes(nouveauStatut);
    if (!autorise) throw new ConflictException(`Transition invalide : ${patient.statut} → ${nouveauStatut}`);

    patient.statut = nouveauStatut;
    return this.patientBlocRepo.save(patient);
  }

  // Décision de triage sur le fil de prescription : le patient est apte à suivre le circuit CPA.
  // Bascule (ou remet) le patient en attente de planification CPA.
  async marquerApteCpa(patientId: string): Promise<PatientBloc> {
    const patient = await this.patientBlocRepo.findOne({ where: { patientId } });
    if (!patient) throw new NotFoundException(`Patient ${patientId} non trouvé`);

    if (patient.statut === PatientStatut.CPA_INAPTE) {
      patient.statut = PatientStatut.EN_ATTENTE_CPA;
      patient.motifRefusCpa = null;
      await this.patientBlocRepo.save(patient);
    }
    return patient;
  }

  // Décision de triage sur le fil de prescription : le patient est inapte au circuit CPA.
  // Nécessite un motif de refus, notifie automatiquement le service d'origine.
  async marquerInapteCpa(patientId: string, motifRefus: string): Promise<PatientBloc> {
    if (!motifRefus || !motifRefus.trim()) {
      throw new BadRequestException('Le motif du refus est obligatoire.');
    }

    const patient = await this.changerStatut(patientId, PatientStatut.CPA_INAPTE);
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
      this.logger.error(`Erreur notification service origine après refus CPA: ${(err as Error).message}`);
    }

    return patient;
  }
}
