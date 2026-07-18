import { IsDateString } from 'class-validator';

export class UpdateDateInterventionDto {
  @IsDateString() dateIntervention: string;
}
