import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient, PatientStatut } from '../entities/patient.entity';

@Injectable()
export class PatientStatutService {
  constructor(@InjectRepository(Patient) private patientRepo: Repository<Patient>) {}

  async changerStatut(patientId: string, nouveauStatut: PatientStatut): Promise<Patient> {
    const patient = await this.patientRepo.findOne({ where: { id: patientId } });
    if (!patient) throw new Error('Patient non trouvé');

    const transitionsValides: Record<PatientStatut, PatientStatut[]> = {
      [PatientStatut.EN_ATTENTE_CPA]: [PatientStatut.CPA_REALISE],
      [PatientStatut.CPA_REALISE]: [PatientStatut.EN_ATTENTE_VPA],
      [PatientStatut.EN_ATTENTE_VPA]: [PatientStatut.VPA_REALISE],
      [PatientStatut.VPA_REALISE]: [PatientStatut.PRET_POUR_BLOC],
      [PatientStatut.PRET_POUR_BLOC]: [PatientStatut.EN_COURS_OPERATION],
      [PatientStatut.EN_COURS_OPERATION]: [PatientStatut.EN_SALLE_REVEIL],
      [PatientStatut.EN_SALLE_REVEIL]: [PatientStatut.SORTI],
      [PatientStatut.SORTI]: [],
    };

    const autorise = transitionsValides[patient.statut]?.includes(nouveauStatut);
    if (!autorise) throw new Error(`Transition invalide : ${patient.statut} → ${nouveauStatut}`);

    patient.statut = nouveauStatut;
    return this.patientRepo.save(patient);
  }
}
