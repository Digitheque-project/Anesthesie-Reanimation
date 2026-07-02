import { PartialType, OmitType } from '@nestjs/mapped-types';
import { AdmitExistingPatientDto } from './admit-existing-patient.dto';

export class UpdatePatientBlocDto extends PartialType(OmitType(AdmitExistingPatientDto, ['patientId'] as const)) {}
