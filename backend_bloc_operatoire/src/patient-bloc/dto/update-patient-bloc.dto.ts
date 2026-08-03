import { PartialType, OmitType } from '@nestjs/mapped-types';
import { AdmitExistingPatientDto } from './admit-existing-patient.dto';

// `statut` est exclu : cette route générique ne doit jamais pouvoir le modifier directement,
// sous peine de contourner les vérifications de transition, prérequis et traçabilité de
// PatientBlocStatutService.changerStatut() — seul point de passage valide pour tout changement de
// statut (voir les routes dédiées .../apte-cpa, .../inapte-cpa, etc.).
export class UpdatePatientBlocDto extends PartialType(
  OmitType(AdmitExistingPatientDto, ['patientId', 'statut'] as const),
) {}
